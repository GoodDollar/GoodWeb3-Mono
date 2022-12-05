import { ArrowForwardIcon, Image, Text, View } from "native-base";
import { ColorType } from "native-base/lib/typescript/components/types";
import React, { FC } from "react";
import { BaseButton, ClaimCardContent } from "../buttons";
import { openLink } from "../utils";
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
      w="275px"
      h="423px"
      bg={backgroundColor}
      borderRadius={30}
      flex={1}
      justifyContent={content?.length !== 1 ? "space-between" : undefined}
      flexDirection="column"
      alignItems="center"
      px="17px"
      py="24px"
    >
      <Title color={titleColor}>{title}</Title>

      {content?.map(contentItem => (
        <>
          {!!contentItem.description && (
            <Text color={descriptionColor} fontSize="16px" fontWeight="500" pt="16px" pb="30px">
              {contentItem.description}
            </Text>
          )}

          {!!contentItem.imageUrl && (
            <Image
              src={contentItem.imageUrl}
              w="241px"
              style={{ aspectRatio: 241 / 178 }}
              borderRadius={10}
              alt="GoodDollar"
            />
          )}

          {!!contentItem.link && (
            <BaseButton
              text={contentItem.link.linkText}
              onPress={() => contentItem.link && openLink(contentItem.link.linkUrl)}
              bg="white"
              innerText={{ fontSize: "16px", fontWeight: "600", color: "main" }}
              px="0"
              pl="16px"
              pr="6px"
              innerView={{
                width: "217px",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
              }}
              borderRadius={15}
            >
              <View w="46px" h="46px" bg="main" borderRadius={12} justifyContent="center" alignItems="center">
                <ArrowForwardIcon color="white" />
              </View>
            </BaseButton>
          )}

          {!!contentItem.list && (
            <View pt="30px">
              {contentItem.list?.map((item, index, list) => (
                <Text color="#696969" fontSize="15px" fontWeight="600" pb={index === list.length - 1 ? "0" : "20px"}>
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
