import { ArrowForwardIcon, Text, View } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import React, { FC } from "react";
import { BaseButton, ClaimCardContent } from "../buttons";
import { Image } from "../images";
import { openLink } from "@gooddollar/web3sdk-v2";
import Title from "./Title";

interface ClaimCardProps {
  titleColor: ColorType;
  descriptionColor: ColorType;
  backgroundColor: ColorType;
  title: string;
  content?: ClaimCardContent[];
}

const ClaimCard: FC<ClaimCardProps> = ({ backgroundColor, titleColor, descriptionColor, content, title }) => {
  return (
    <View
      w="275"
      h="423"
      bg={backgroundColor}
      borderRadius={30}
      flex={1}
      justifyContent={content?.length !== 1 ? "space-between" : undefined}
      flexDirection="column"
      alignItems="center"
      px="17"
      py="6"
    >
      <Title fontFamily='Montserrat' color={titleColor}>{title}</Title>

      {content?.map(contentItem => (
        <>
          {!!contentItem.description && (
            <Text color={descriptionColor} fontSize="md" fontFamily="Roboto" fontWeight="medium" pt="4" pb="30">
              {contentItem.description}
            </Text>
          )}

          {!!contentItem.imageUrl && (
            <Image source={{ uri: contentItem.imageUrl }} w="241" h="auto" borderRadius={10} alt="GoodDollar" />
          )}

          {!!contentItem.link && (
            <BaseButton
              text={contentItem.link.linkText}
              onPress={() => contentItem.link && openLink(contentItem.link.linkUrl)}
              bg="white"
              innerText={{ fontSize: "md", fontWeight: "semibold", fontFamily: "Montserrat", color: "main" }}
              px="0"
              pl="4"
              pr="1.5"
              innerView={{
                width: "217",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
              borderRadius={15}
            >
              <View w="46" h="46" bg="main" borderRadius={12} justifyContent="center" alignItems="center">
                <ArrowForwardIcon color="white" />
              </View>
            </BaseButton>
          )}

          {!!contentItem.list && (
            <View pt="30">
              {contentItem.list?.map((item, index, list) => (
                <Text color="dimgray" fontSize="15" fontWeight="semibold" fontFamily='Montserrat' pb={index === list.length - 1 ? "0" : "5"}>
                  {item.key} <Text color="main">{item.value}</Text>
                </Text>
              ))}
            </View>
          )}
        </>
      ))}
    </View>
  );
};

export default ClaimCard;
