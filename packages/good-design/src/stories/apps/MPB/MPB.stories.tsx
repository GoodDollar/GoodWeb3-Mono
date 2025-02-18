// Button.stories.js
import React from "react";
import MPB from "../../../apps/MBP/MPB";

export default {
  title: "Components/MPB",
  component: MPB,
  argTypes: {
    srcNetwork: {
      control: {
        type: "inline-radio",
        options: ["Ethereum", "Celo", "Fuse"]
      }
    },
    dstNetwork: {
      control: {
        type: "inline-radio",
        options: ["Ethereum", "Celo", "Fuse"]
      }
    },
    provider: {
      control: {
        type: "inline-radio",
        options: ["Axelar", "LayerZero"]
      }
    }
  }
};

const Template = args => <MPB {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

export const Secondary = Template.bind({});
Secondary.args = {};
