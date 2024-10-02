import React from "react";
import { HStack, Text, VStack } from "native-base";
import { TransText } from "./Trans";

const BlueBullet = () => <Text variant="sm-grey" color="gdPrimary">{`\u2022`}</Text>;

const BulletPointList = ({ bulletPoints }: { bulletPoints: string[] }) => (
  <VStack space={2} marginLeft={6} marginBottom={4}>
    {bulletPoints.map((copy, index) => (
      <HStack key={index} space={2}>
        <BlueBullet />
        <TransText t={copy} variant="sm-grey-650" />
      </HStack>
    ))}
  </VStack>
);

export { BlueBullet, BulletPointList };
