import React, { useCallback } from "react";
import { Center, HStack, ICenterProps } from "native-base";
import { openLink } from "@gooddollar/web3sdk-v2";

import { BasePressable } from "../buttons";
import { Image } from "../images";
import { cardShadow } from "../../theme/shadows";
import { withTheme } from "../../theme/hoc/withTheme";
import { TransText } from "./Trans";

interface IImageCard extends ICenterProps {
  picture?: any;
  title: string;
  content: object;
  link: string;
  footer?: object;
  styles?: {
    button?: object;
    container?: object;
    title?: object;
    content?: object;
    picture?: object;
    footer?: object;
  };
}

export const theme = {
  baseStyle: {
    display: "flex",
    overflow: "hidden",
    marginBottom: 4,
    paddingBottom: 1,
    styles: {
      footer: {
        marginTop: 2,
        display: "flex",
        width: "100%",
        alignItems: "flex-end"
      },
      picture: {
        minWidth: "325",
        width: "100%",
        paddingBottom: "56.25%" // 16:9 ratio
      }
    }
  },
  variants: {
    "offer-card": () => ({
      borderRadius: 20,
      ...cardShadow,
      styles: {
        content: {
          paddingY: 4,
          paddingX: 4,
          width: "100%",
          alignItems: "flex-start"
        },
        picture: {
          minWidth: "325",
          width: "100%",
          paddingBottom: "56.25%", // 16:9 ratio
          resizeMode: "cover"
        },
        title: {
          fontFamily: "subheading",
          fontSize: "md",
          fontWeight: 500,
          color: "goodGrey.600",
          paddingBottom: 2
        }
      }
    }),
    "news-card": () => ({
      shadow: 1,
      borderLeftWidth: "10px",
      borderLeftColor: "gdPrimary",
      borderRadius: 6,
      styles: {
        footer: {
          display: "flex",
          width: "100%",
          alignItems: "flex-end"
        },
        container: {
          flexDirection: "column",
          height: "310",
          justifyContent: "flex-start"
        },
        button: {
          width: "340",
          height: "310",
          marginBottom: 4
        },
        content: {
          flex: 1,
          justifyContent: "space-between",
          color: "goodGrey.400",
          fontFamily: "subheading",
          fontSize: "2xs",
          fontWeight: "400",
          lineHeight: "130%",
          paddingBottom: 2,
          maxWidth: 400,
          paddingTop: 2,
          paddingX: 2
        },
        picture: {
          minWidth: "375",
          width: "100%",
          paddingBottom: "56.25%",
          resizeMode: "contain"
        },
        title: {
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 600,
          lineHeight: "110%",
          color: "heading:alpha.80",
          paddingBottom: 2
        }
      }
    })
  }
};

const ImageCard = withTheme({ name: "ImageCard", skipProps: ["content", "footer", "picture", "title"] })(
  ({ title, content, footer, link, styles = {}, picture, ...props }: IImageCard) => {
    const handlePress = useCallback(async () => {
      await openLink(link, "_blank");
    }, [link]);

    return (
      <BasePressable onPress={handlePress} {...styles.button}>
        <Center {...props} {...styles.container}>
          {picture && <Image source={picture} alt="Image" {...styles.picture} />}
          <Center width="100%" alignItems="flex-start" {...styles.content}>
            <TransText t={title} fontFamily="subheading" {...styles.title} />
            {content}
            <HStack {...styles.footer}>{footer}</HStack>
          </Center>
        </Center>
      </BasePressable>
    );
  }
);

export default ImageCard;
