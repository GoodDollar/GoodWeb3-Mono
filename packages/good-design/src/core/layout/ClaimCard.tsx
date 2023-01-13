import { ArrowForwardIcon, Text, View, Box } from "native-base";
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
      shadow="1"
      w="240"
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

      <Title fontSize="xl" lineHeight="36" fontWeight="bold" fontFamily="heading" color={titleColor}>{title}</Title>

      {content?.map((contentItem, index) => (
        <Box key={index}>
          {!!contentItem.description && (
            <Text color={descriptionColor} fontSize="15" fontFamily="subheading" fontWeight="normal" pt="4" pb="30">
              {contentItem.description}
            </Text>
          )}

          {!!contentItem.imageUrl && (
            <Image source={{ uri: contentItem.imageUrl }} w="208" h="178" borderRadius={10} alt="GoodDollar" />
          )}

          {!!contentItem.link && (
            <BaseButton 
              text={contentItem.link.linkText}
              onPress={() => contentItem.link && openLink(contentItem.link.linkUrl)}
              bg="white"
              w="208"
              h="58"
              innerText={{
                fontSize: "md",
                fontWeight: "medium",
                fontFamily: "subheading",
                color: "main"
              }}
              innerView={{
                width: "208",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                px: '1.5',
                pl: '4',
                pr: '1.5',
                flexGrow: "0",
                
              }}
              borderRadius={15}
            >
              <View w="46" h="46" mr="1.5" bg="primary" borderRadius="12" justifyContent="center" alignItems="center">
                <ArrowForwardIcon color="white" />
              </View>
            </BaseButton>
          )}

          {!!contentItem.list && (
            <View pt="30" textAlign="center">
              {contentItem.list?.map((item, index, list) => (
                <Text
                  key={index}
                  color="goodGrey.500"
                  bold
                  fontSize="16"
                  fontFamily="subheading"
                  fontWeight="normal"
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  pb={index === list.length - 1 ? "0" : "5"}>
                  {item.key} <Text color="primary">{item.value}</Text>
                </Text>
              ))}
            </View>
          )}
        </Box>
      ))}
    </View>
  );
};

export default ClaimCard;
