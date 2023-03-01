import { Text, View, Box } from "native-base";
import React, { FC, useCallback } from "react";
import { ClaimCardContent, ArrowButton } from "../buttons";
import { Image } from "../images";
import { openLink } from "@gooddollar/web3sdk-v2";
import Title from "./Title";
import BasePressable from "../buttons/BasePressable";
interface ClaimCardProps {
  bgColor: string;
  title: {
    text: string;
    color: string;
  };
  content?: ClaimCardContent[];
  externalLink?: string;
}

const ClaimCard: FC<ClaimCardProps> = ({ content, title, bgColor, externalLink }) => {
  const handlePress = useCallback(async () => {
    if (externalLink) {
      await openLink(externalLink, "_blank");
    }
  }, []);

  return (
    <BasePressable
      w={240}
      h={423}
      onPress={handlePress}
      innerView={{
        shadow: "1",
        bg: bgColor,
        borderRadius: 30,
        flex: 1,
        flexDirection: "column",
        alignItems: "flex-start",
        px: "17",
        py: "6"
      }}
      viewInteraction={{ hover: { shadow: "3" } }}
    >
      <Title fontSize="xl" lineHeight="36" pb="6" fontWeight="bold" fontFamily="heading" color={title.color}>
        {title.text}
      </Title>

      {content?.map((contentItem, index) => (
        <Box key={index}>
          {!!contentItem.subTitle && (
            <Text
              color={contentItem.subTitle.color}
              fontSize="md"
              fontFamily="subheading"
              fontWeight="medium"
              lineHeight="25px"
              pb="2"
            >
              {contentItem.subTitle.text}
            </Text>
          )}
          {!!contentItem.description && (
            <Text color={contentItem.description.color} fontSize="16" fontFamily="subheading" fontWeight="normal">
              {contentItem.description.text}
            </Text>
          )}
          {!!contentItem.imageUrl && (
            <Image source={{ uri: contentItem.imageUrl }} w="208" h="178" borderRadius={10} alt="GoodDollar" />
          )}

          {!!contentItem.imgSrc && <Image source={contentItem.imgSrc} w="208" h="auto" />}

          {!!contentItem.link && (
            <ArrowButton
              text={contentItem.link.linkText}
              onPress={() => contentItem.link && openLink(contentItem.link.linkUrl)}
            />
          )}
          {!!contentItem.list && (
            <View textAlign="center">
              {contentItem.list?.map(({ id, key, value }) => (
                <Box borderBottomColor="borderGrey" borderBottomWidth="1px">
                  <Text
                    key={id}
                    color="goodGrey.500"
                    bold
                    fontSize="16"
                    fontFamily="subheading"
                    fontWeight="normal"
                    display="flex"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    {key} <Text color="primary">{value}</Text>
                  </Text>
                </Box>
              ))}
            </View>
          )}
        </Box>
      ))}
    </BasePressable>
  );
};

export default ClaimCard;
