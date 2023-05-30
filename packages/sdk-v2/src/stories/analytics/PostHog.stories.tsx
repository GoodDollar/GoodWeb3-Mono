import React, { useEffect, useState } from "react";
import { W3Wrapper } from "../W3Wrapper";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { PostHog } from "../../sdk/analytics/posthog/posthog";
import { useSDK } from "../../sdk/base/react";

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
    init();
  }, []);
  return <div>{String(initialized)}</div>;
};
const Page = (params: PageProps) => (
  <W3Wrapper withMetaMask={false}>
    <Web3Component {...params} />
  </W3Wrapper>
);

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
