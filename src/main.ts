import { MqttConnection } from "./mqttconnector";
import {
  type MQTTOptions,
  type FetchOptions,
  type FetchCallbackFunctionType,
} from "xcachemqtt";

const defaultMqttOptions: MQTTOptions = {
  host: "mqtt.example.com",
  port: 1883,
  protocol: "ws",
  // other options like username, password, etc. can be added here
};

/**
 * This class will provide the ability to intialise the connection and fetch data
 *
 */
export class XFetcher {
  private readonly defaultTopic = "default/topic";
  private readonly mqttConnection: MqttConnection;

  constructor(mqttOptions = defaultMqttOptions) {
    this.mqttConnection = MqttConnection.getInstance(
      mqttOptions,
      this.defaultTopic
    );
  }

  async fetchData({
    options,
    onFetchCallback,
  }: {
    options: FetchOptions;
    onFetchCallback: FetchCallbackFunctionType;
  }): Promise<void> {
    console.log("fetchData is called with options", options);

    // let subscriptionXcacheRequest: SubscriptionXCacheRequest = {
    //     key: options.key,
    //     notifyAs: NOTIFY_AS.LINK,
    //     path: options.path,
    //     topic: this.defaultTopic,
    //     ttl: 0
    // }
    // // call xcache API for subscription
    // const response = await fetch(`http://localhost:3000/subscriptions/${options.key}/clientID`, {
    //     method: "PUT",
    //     body: JSON.stringify(subscriptionXcacheRequest),
    //     headers: { "Content-Type": "application/json" },
    // });

    //tconsole.log(await response.json());

    // subscribe to the topic
    await this.mqttConnection
      .subscribe(
        {
          key: options.key,
          path: options.path,
        },
        onFetchCallback
      )
      .then(() => {
        console.log("Subscribed successfully");
      })
      .catch((error) => {
        console.log("Subscription failed", error);
        throw error;
      });
    console.log("fetchData subscription complete", options);
  }
}
