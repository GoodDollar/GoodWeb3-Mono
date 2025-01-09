import React, { useCallback } from "react";
import { HStack, ICenterProps, VStack } from "native-base";
import { openLink } from "@gooddollar/web3sdk-v2";
import { Platform } from "react-native";

import { BasePressable } from "../buttons";
import { Image } from "../images";
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
        paddingBottom: "56.25%"
      }
    }
  },
  variants: {
    "offer-card": () => ({
      borderRadius: 20,
      styles: {
        button: {
          marginBottom: 4
        },
        content: {
          paddingY: 4,
          paddingX: 4,
          width: "100%",
          alignItems: "flex-start"
        },
        picture: {
          ...Platform.select({
            web: {
              minWidth: "325",
              width: "100%",
              paddingBottom: "56.25%"
            },
            android: {
              maxWidth: "100%",
              height: "auto",
              aspectRatio: 16 / 9
            }
          }),
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
      borderLeftWidth: 10,
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
          height: "350",
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
          lineHeight: 14.4, // "130%"
          paddingBottom: 2,
          maxWidth: 400,
          paddingTop: 2,
          paddingX: 2
        },
        picture: {
          width: "100%",
          ...Platform.select({
            web: {
              paddingBottom: "56.25%"
            },
            android: {
              aspectRatio: 16 / 9
            }
          }),
          resizeMode: "contain"
        },
        title: {
          fontFamily: "subheading",
          fontSize: "sm",
          fontWeight: 600,
          lineHeight: Platform.select({ web: 20.8, android: 22 }),
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
        <VStack
          {...props}
          {...styles.container}
          {...Platform.select({ web: { ...styles.container }, android: { shadow: 1, backgroundColor: "white" } })}
        >
          {picture && <Image source={picture} alt="Image" {...styles.picture} />}
          <VStack width="100%" alignItems="flex-start" {...styles.content}>
            <TransText t={title} fontFamily="subheading" {...styles.title} />
            {content}
            <HStack {...styles.footer}>{footer}</HStack>
          </VStack>
        </VStack>
      </BasePressable>
    );
  }
);

export default ImageCard;
