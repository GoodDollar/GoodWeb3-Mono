import React, { useCallback } from "react";
import { Center, HStack, ICenterProps, Text } from "native-base";
import { openLink } from "@gooddollar/web3sdk-v2";

import { BasePressable } from "../buttons";
import { Image } from "../images";
import { cardShadow } from "../../theme";
import { withTheme } from "../../theme/hoc/withTheme";

interface IImageCard extends ICenterProps {
  picture?: string;
  title: string;
  content: object;
  link: string;
  footer?: object;
  containerStyles?: object;
  titleStyles?: object;
  contentStyles?: object;
  pictureStyles?: object;
  footerStyles?: object;
}

export const theme = {
  baseStyle: {
    display: "flex",
    overflow: "hidden",
    marginBottom: 4,
    paddingBottom: 1,
    footerStyles: {
      marginTop: 2,
      display: "flex",
      width: "100%",
      alignItems: "flex-end"
    },
    pictureStyles: {
      minWidth: 325,
      width: "100%",
      paddingBottom: "56.25%"
    }
  },
  variants: {
    "offer-card": () => ({
      borderRadius: 20,
      ...cardShadow,
      containerStyles: {
        paddingY: 4,
        paddingX: 4,
        width: "100%",
        alignItems: "flex-start"
      },
      pictureStyles: {
        resizeMode: "cover"
      },
      titleStyles: {
        fontFamily: "subheading",
        fontSize: "md",
        fontWeight: "500",
        color: "goodGrey.600",
        paddingBottom: 2
      }
    }),
    "news-card": () => ({
      shadow: 1,
      borderLeftWidth: "10px",
      borderLeftColor: "main",
      borderRadius: 6,
      containerStyles: {
        paddingTop: 2,
        paddingX: 2,
        width: "100%",
        alignItems: "flex-start"
      },
      pictureStyles: {
        resizeMode: "cover"
      },
      titleStyles: {
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "600",
        lineHeight: "110%",
        color: "heading:alpha.80",
        paddingBottom: 2
      }
    })
  }
};

const ImageCard = withTheme({ name: "ImageCard", skipProps: ["content", "footer"] })(
  ({
    title,
    content,
    footer,
    link,
    containerStyles,
    titleStyles,
    footerStyles,
    pictureStyles,
    picture,
    ...props
  }: IImageCard) => {
    const handlePress = useCallback(async () => {
      await openLink(link, "_blank");
    }, [link]);

    return (
      <BasePressable onPress={handlePress}>
        <Center {...props}>
          {picture && <Image src={picture} alt="Image" {...pictureStyles} />}
          <Center width="100%" alignItems="flex-start" {...containerStyles}>
            <Text fontFamily="subheading" {...titleStyles}>
              {title}
            </Text>
            {content}
            <HStack {...footerStyles}>{footer}</HStack>
          </Center>
        </Center>
      </BasePressable>
    );
  }
);

export default ImageCard;
