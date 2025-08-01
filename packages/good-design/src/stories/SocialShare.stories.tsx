import React from "react";
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
  }
};

export const Default = () => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Social Share Component
    </Text>
    <SocialShareBar message="I just did my first claim(s) of G$ this week!" url="https://gooddollar.org" />
  </VStack>
);

export const CustomMessage = () => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Custom Message
    </Text>
    <SocialShareBar
      message="Check out GoodDollar - the future of universal basic income!"
      url="https://gooddollar.org"
    />
  </VStack>
);

export const CustomURL = () => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Custom URL
    </Text>
    <SocialShareBar message="I just did my first claim(s) of G$ this week!" url="https://app.gooddollar.org" />
  </VStack>
);

export const LongMessage = () => (
  <VStack space={4} p={4} bg="white" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2}>
      Long Message
    </Text>
    <SocialShareBar
      message="I just claimed my first GoodDollar tokens today! This is an amazing project that's working towards universal basic income through blockchain technology. Everyone should check it out!"
      url="https://gooddollar.org"
    />
  </VStack>
);

export const DarkBackground = () => (
  <VStack space={4} p={4} bg="gray.800" borderRadius="md">
    <Text fontSize="lg" fontWeight="bold" mb={2} color="white">
      Dark Background
    </Text>
    <SocialShareBar message="I just did my first claim(s) of G$ this week!" url="https://gooddollar.org" />
  </VStack>
);
