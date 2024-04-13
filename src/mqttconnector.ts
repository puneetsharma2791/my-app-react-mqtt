import mqtt, {
  MqttClient,
  type IClientOptions,
  type IClientPublishOptions,
} from "mqtt";

import type {
  FetchCallbackFunctionType,
  SubscribeOptions,
  UpdateNotification,
} from "xcachemqtt";
import { NOTIFY_AS } from "xcachemqtt";

export class MqttConnection {
  private static instance: MqttConnection | null = null;
  private client: MqttClient | null = null;
  private readonly options: IClientOptions;
  private readonly topic: string;
  private readonly keyCallbackMap: Record<string, FetchCallbackFunctionType> =
    {};

  private constructor(options: IClientOptions, topic: string) {
    this.options = options;
    this.topic = topic;
    console.log("MQTT Connection initialised with topic ", topic);
    if (!this.client || this.client?.connected === false) {
      this.connect();
      console.log("MQTT connection made with broker");
    }
  }

  /**
   *
   * The get instance helps in making sure that a single connection is made to MQTT
   * @param options
   * @param topic
   * @returns
   */
  static getInstance(options: IClientOptions, topic: string): MqttConnection {
    if (!MqttConnection.instance) {
      MqttConnection.instance = new MqttConnection(options, topic);
    }
    return MqttConnection.instance;
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        this.client = mqtt.connect(this.options);
        resolve();
        this.client.on("error", (error) => {
          console.error("MQTT connection error:", error);
          reject(error);
        });
      }
    });
  }

  private ensureConnected(): Promise<void> {
    console.log("Ensuring connection!");
    if (!this.client || this.client?.connected === false) {
      return this.connect();
    }
    return Promise.resolve();
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      console.log("Disconnected from MQTT broker");
    }
  }

  async publish(
    message: string,
    options?: IClientPublishOptions
  ): Promise<void> {
    await this.ensureConnected();
    return await new Promise<void>((resolve, reject) => {
      if (this.client) {
        this.client.publish(this.topic, message, options, (error) => {
          if (error) {
            console.error("MQTT publish error:", error);
            reject(error);
          } else {
            console.log("Published message to default topic:" + this.topic);
            resolve();
          }
        });
      } else {
        console.error("MQTT client is not connected");
        reject(new Error("MQTT client is not connected"));
      }
    });
  }

  async subscribe(
    options: SubscribeOptions,
    onMessage: FetchCallbackFunctionType
  ): Promise<void> {
    await this.ensureConnected();
    return await new Promise<void>((resolve, reject) => {
      if (this.client) {
        console.log("Connected to MQTT broker");
        this.client?.subscribe(this.topic, (error) => {
          if (error) {
            console.error("MQTT subscribe error:", error);
            reject(error);
          } else {
            this.keyCallbackMap[options.key] = onMessage;
            console.log("Subscribed to topic:" + this.topic);
            resolve();
          }
        });
        this.client.on("message", (topic, message) => {
          console.log(
            "MQTT message received on topic " + topic,
            JSON.parse(message.toString())
          );
          let updateNotification: UpdateNotification = JSON.parse(
            message.toString()
          );
          const callback = this.keyCallbackMap[updateNotification.key];
          if (callback) {
            if (updateNotification.valueType === NOTIFY_AS.LINK) {
              callback({ dataLink: updateNotification.value.toString() });
            }
          }
        });
      } else {
        console.error("MQTT client is not connected");
        reject(new Error("MQTT client is not connected"));
      }
    });
  }
}
