import { Text, View, Box } from "native-base";
import React, { FC, useCallback } from "react";
import { ClaimCardContent } from "../buttons";
import { Image } from "../images";
import Title from "./Title";
import BasePressable from "../buttons/BasePressable";
import { openLink, isMobile as deviceDetect } from "@gooddollar/web3sdk-v2";

interface ClaimCardProps {
  bgColor: string;
  title: {
    text: string;
    color: string;
  };
  content?: ClaimCardContent[];
  externalLink?: string;
}

const ClaimCard: FC<ClaimCardProps> = ({ content = [], title, bgColor, externalLink }) => {
  const { subTitle, description, imageUrl, imgSrc } = content[0] || [];

  const handlePress = useCallback(async () => {
    if (externalLink) {
      await openLink(externalLink, "_blank");
    }
  }, [externalLink]);

  const isMobile = deviceDetect();

  return (
    <BasePressable
      w={isMobile ? 330 : 650}
      h={isMobile ? 290 : "auto"}
      onPress={handlePress}
      innerView={{
        shadow: "1",
        bg: bgColor,
        borderRadius: 30,
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        p: 4
      }}
      viewInteraction={{ hover: { shadow: "3" } }}
    >
      <Title fontSize="xl" lineHeight="36" pb="2" fontWeight="bold" fontFamily="heading" color={title.color}>
        {title.text}
      </Title>

      <Box>
        <Box h={isMobile ? 126 : "auto"}>
          {!!subTitle && (
            <Text
              color={subTitle.color}
              fontSize="md"
              fontFamily="subheading"
              fontWeight="medium"
              lineHeight="25px"
              pb="2"
            >
              {subTitle.text}
            </Text>
          )}
          {!!description && (
            <Text color={description.color} fontSize="16" fontFamily="subheading" fontWeight="normal">
              {description.text}
            </Text>
          )}
        </Box>
        {imageUrl || imgSrc ? (
          <Box h="82" ml="auto" mr="auto" mt={2}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} w="240" h="178" borderRadius={10} alt="GoodDollar" />
            ) : (
              <View ml="auto" mr="auto">
                <Image resizeMode="contain" source={imgSrc} w="240" h="70" />
              </View>
            )}
          </Box>
        ) : null}
      </Box>
    </BasePressable>
  );
};

export default ClaimCard;
