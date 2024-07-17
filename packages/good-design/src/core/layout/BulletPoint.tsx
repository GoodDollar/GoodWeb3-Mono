import React from "react";
import { HStack, Text, VStack } from "native-base";

const BlueBullet = () => <Text variant="sm-grey" color="primary">{`\u2022`}</Text>;

const BulletPointList = ({ bulletPoints }: { bulletPoints: string[] }) => (
  <VStack space={2} marginLeft={6} marginBottom={4}>
    {bulletPoints.map((copy, index) => (
      <HStack key={index} space={2}>
        <BlueBullet />
        <Text variant="sm-grey-650">{copy}</Text>
      </HStack>
    ))}
  </VStack>
);

export { BlueBullet, BulletPointList };