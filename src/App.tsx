import React, { useCallback, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import {
  UpdateNotification,
  NOTIFY_AS,
  FetchOptions,
  MQTTOptions,
  FetchData,
} from "xcachemqtt";
import { XFetcher } from "./main";
import { MqttConnection } from "./mqttconnector";

export type PublishOptions = {
  message: UpdateNotification;
};

const SubscribeForm = () => {
  const MqttOptions: MQTTOptions = {
    host: "localhost",
    port: 8080,
    protocol: "ws",

    // other options like username, password, etc. can be added here
  };

  const [defaultTopic, setDefaultTopicChange] =
    useState<string>("default/topic");

  const [keyArray, setKeyArray] = useState<string[]>([]);

  const mqttConnection = MqttConnection.getInstance(MqttOptions, defaultTopic);
  const xFetcher = new XFetcher();
  const [fetchOptions, setFetchOptions] = useState<FetchOptions>({
    key: "",
    path: "/xcache/assets/neid", // Default value for path
  });
  const [publishedMessage, setPublishedMessage] = useState<
    Record<string, JSX.Element[]>
  >({});

  const [publishOptions, setPublishOptions] = useState<PublishOptions>({
    message: {
      key: "",
      valueType: NOTIFY_AS.VALUE,
      value: "",
    },
  });

  const handleDefaultTopicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    setDefaultTopicChange(value);
  };
  const handleSubscribeFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFetchOptions((prevOptions: any) => ({
      ...prevOptions,
      [name]: value,
    }));
  };

  const handlePublishChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(name, value);

    setPublishOptions((prevOptions) => ({
      ...prevOptions,
      message: {
        ...prevOptions.message,
        [name]: value,
      },
    }));
  };

  const handleValueTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = e.target;
      setPublishOptions((prevOptions) => ({
        ...prevOptions,
        message: {
          ...prevOptions.message,
          valueType: value as NOTIFY_AS,
        },
      }));
    },
    []
  );

  const handleSubscribeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Do something with fetchOptions, like sending it to a backend server
      console.log("handleSubscribeSubmit callled:", fetchOptions);
      let keyAlreadySubscribed = keyArray.find((key: any) => {
        return key === fetchOptions.key;
      });
      if (!keyAlreadySubscribed) {
        await xFetcher.fetchData({
          options: { key: fetchOptions.key, path: fetchOptions.path },
          onFetchCallback: (data: FetchData) => {
            let messageArray = publishedMessage[fetchOptions.key] ?? [];
            setPublishedMessage((prevState) => ({
              ...prevState,
              [fetchOptions.key]: [
                ...messageArray,
                <div>{JSON.stringify(data)}</div>,
              ],
            }));
          },
        });
        setKeyArray((oldArray) => [...oldArray, fetchOptions.key]);
        setFetchOptions({
          key: "",
          path: "/xcache/assets/neid", // Default value for path
        });
      } else {
        alert(
          "The given Key is already subscribed. Please enter a different key"
        );
      }
    },
    [keyArray, fetchOptions, publishedMessage]
  );

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do something with publishOptions, like publishing a message
    console.log("Submitted PublishOptions:", publishOptions);

    mqttConnection.publish(JSON.stringify(publishOptions.message), {});
  };

  return (
    <div className="container mt-5">
      <div className=" mb-3">
        <label>Topic:</label>
        <input
          type="text"
          className="form-control"
          name="topic"
          value={defaultTopic}
          onChange={handleDefaultTopicChange}
          required
        />
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <form onSubmit={handleSubscribeSubmit}>
            <h3>Subscribe Form</h3>
            <div className="form-group mb-3">
              <label>Key:</label>
              <input
                type="text"
                className="form-control"
                name="key"
                value={fetchOptions.key}
                onChange={handleSubscribeFormChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Path:</label>
              <select
                className="form-control"
                name="path"
                value={fetchOptions.path}
                onChange={handleSubscribeFormChange}
              >
                <option value="/xcache/assets/neid">/xcache/assets/neid</option>
                <option value="/xcache/123">/xcache/123</option>
                <option value="/xcache/456">/xcache/456</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <form onSubmit={handlePublishSubmit}>
            <h3>Publish Form</h3>

            <div className="form-group mb-3">
              <label>Key:</label>
              <input
                type="text"
                className="form-control"
                name="key"
                value={publishOptions.message.key}
                onChange={handlePublishChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Value Type:</label>
              <select
                className="form-control"
                name="valueType"
                value={publishOptions.message.valueType}
                onChange={handleValueTypeChange}
              >
                <option value={NOTIFY_AS.LINK}>{NOTIFY_AS.LINK}</option>
                <option value={NOTIFY_AS.VALUE}>{NOTIFY_AS.VALUE}</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Value:</label>
              <textarea
                className="form-control"
                name="value"
                value={
                  typeof publishOptions.message.value === "string"
                    ? publishOptions.message.value
                    : JSON.stringify(publishOptions.message.value)
                }
                onChange={handlePublishChange}
                rows={3}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Publish
            </button>
          </form>
        </div>
      </div>
      {keyArray.map((key) => (
        <div className="row mt-5">
          <div className="col-md-10 offset-md-1">
            <h4>Last Message Received For Key: {key}</h4>
            <pre>{publishedMessage[key]}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscribeForm;
