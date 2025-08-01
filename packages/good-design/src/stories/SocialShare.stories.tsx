import * as React from "react";
import { VStack, Text } from "native-base";
import { SocialShareBar } from "../advanced/socialshare";

export default {
  title: "Advanced/SocialShare",
  component: SocialShareBar,
  parameters: {
    docs: {
      description: {
        component: "Social share component for sharing content on social media platforms"
      }
    }
  },
  argTypes: {
    message: {
      control: { type: "text" },
      description: "The message to share on social media",
      defaultValue: "I just did my first claim(s) of G$ this week!"
    },
    url: {
      control: { type: "text" },
      description: "The URL to share",
      defaultValue: "https://gooddollar.org"
    }
  }
};

export const Default = args => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Social Share Component
    </Text>
    <SocialShareBar {...args} />
  </VStack>
);

export const CustomMessage = args => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Custom Message
    </Text>
    <SocialShareBar {...args} />
  </VStack>
);

CustomMessage.args = {
  message: "Check out GoodDollar - the future of universal basic income!",
  url: "https://gooddollar.org"
};

export const CustomURL = args => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Custom URL
    </Text>
    <SocialShareBar {...args} />
  </VStack>
);

CustomURL.args = {
  message: "I just did my first claim(s) of G$ this week!",
  url: "https://app.gooddollar.org"
};

export const LongMessage = args => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Long Message
    </Text>
    <SocialShareBar {...args} />
  </VStack>
);

LongMessage.args = {
  message:
    "I just claimed my first GoodDollar tokens today! This is an amazing project that's working towards universal basic income through blockchain technology. Everyone should check it out!",
  url: "https://gooddollar.org"
};

export const DarkBackground = args => (
  <VStack space={4} p={4} bg="gray.800" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2} color="white">
      Dark Background
    </Text>
    <SocialShareBar {...args} />
  </VStack>
);

DarkBackground.args = {
  message: "I just did my first claim(s) of G$ this week!",
  url: "https://gooddollar.org"
};
