import React, { useEffect, useState } from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { PostHog } from "../../sdk/analytics/posthog/posthog";
import { AnalyticsProvider, useSendAnalytics } from "../../sdk";

export interface PageProps {
  apiKey: string;
}

const Web3Component = (params: PageProps) => {
  const posthog = new PostHog({ apiKey: params.apiKey });
  const [initialized, setInitialized] = useState(false);
  const init = async () => {
    console.log("initializing");
    await posthog.initialize({} as any);
    console.log("initialized");
    setInitialized(true);
    posthog.send("test", { x: 1, y: 2 });
  };
  useEffect(() => {
    void init();
  }, []);
  return <div>{String(initialized)}</div>;
};
const Page = (params: PageProps) => (
  <W3Wrapper withMetaMask={false}>
    <Web3Component {...params} />
  </W3Wrapper>
);

export const config = {
  google: { enabled: true },
  amplitude: { apiKey: "6a5c4b8d53046c57867caa475aeb926f", enabled: true }
};

export const analyticsConfig = {
  google: { enabled: true },
  amplitude: { apiKey: process.env.REACT_APP_AMPLITUDE_API_KEY, enabled: true }
};

const AnalyticsTest = () => {
  const { track } = useSendAnalytics();

  useEffect(() => {
    track("test-event", {});
  }, [track]);

  return <></>;
};

export const Analytics = () => {
  return (
    <W3Wrapper withMetaMask={false}>
      <AnalyticsProvider config={config} appProps={{ env: "test", osVersion: "1", productEnv: "test", version: "1" }}>
        <AnalyticsTest />
      </AnalyticsProvider>
    </W3Wrapper>
  );
};

export default {
  title: "PostHog example",
  component: Page
} as ComponentMeta<typeof Page>;

const Template: ComponentStory<typeof Page> = args => (
  <W3Wrapper withMetaMask={false}>
    <Web3Component {...args} />
  </W3Wrapper>
);

export const PostHogSDKExample = Template.bind({});
PostHogSDKExample.args = {
  apiKey: ""
};
