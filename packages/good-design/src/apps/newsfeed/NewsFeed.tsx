import React, { FC, useCallback, useMemo } from "react";
import { FeedPost } from "@gooddollar/web3sdk-v2";
import { Heading, HStack, Image, Spinner, Stack, VStack, Text } from "native-base";

import { BasePressable } from "../../core";
import SvgXml from "../../core/images/SvgXml";
import { withTheme } from "../../theme";
import { CentreBox } from "../../core/layout/CentreBox";
import { openLink } from "@gooddollar/web3sdk-v2";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
import { IVStackProps } from "native-base/lib/typescript/components/primitives/Stack/VStack";

interface NewsFeedItemProps {
  item: FeedPost;
  pictureStyles?: object;
  containerStyles?: object;
  titleStyles?: object;
  contentStyles?: object;
  footerStyles?: object;
  publishedStyles?: object;
  sponsoredStyles?: object;
}

export const NewsFeedItem: FC<NewsFeedItemProps> = withTheme({ name: "NewsFeedItem" })(
  ({
    item,
    containerStyles,
    pictureStyles,
    titleStyles,
    contentStyles,
    footerStyles,
    publishedStyles,
    sponsoredStyles,
    ...props
  }: NewsFeedItemProps) => {
    const { picture, title, content, published, sponsored_logo, link } = item;

    const formattedPublished = useMemo(
      () =>
        new Date(published).toLocaleDateString("en", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
      [published]
    );

    const handlePress = useCallback(async () => {
      await openLink(link, "_blank");
    }, [link]);

    return (
      <BasePressable onPress={handlePress} width="340" height="310" marginBottom="4">
        <CentreBox flexDir="column" {...props} justifyContent="flex-start" height="310">
          {picture && (
            <Image
              minW="375"
              width="100%"
              pb="56.25%"
              src={picture}
              alt="Image"
              resizeMode="contain"
              {...pictureStyles}
            />
          )}
          <CentreBox flex="1" justifyContent="space-between" {...containerStyles}>
            <Text {...titleStyles}>{title}</Text>
            <Text {...contentStyles}>{content}</Text>
            <HStack {...footerStyles}>
              <Text {...publishedStyles}>{formattedPublished}</Text>
              <CentreBox marginLeft="auto">
                {sponsored_logo && <SvgXml src={sponsored_logo} height="28" width="45" {...sponsoredStyles} />}
              </CentreBox>
            </HStack>
          </CentreBox>
        </CentreBox>
      </BasePressable>
    );
  }
);

export const NewsFeed = withTheme({ name: "NewsFeed", skipProps: "feed" })(
  ({ feed, variant, containerStyles }: { feed: FeedPost[]; containerStyles?: any } & IHStackProps & IVStackProps) => {
    const ContainerDirection = variant === "multiRow" ? HStack : VStack;

    return (
      <CentreBox flexDir="column" minWidth="340" maxWidth="100%">
        <Stack w="100%">
          <CentreBox
            w="100%"
            justifyContent="center"
            alignItems="center"
            px={4}
            py={2}
            marginBottom={4}
            backgroundColor="rgba(0,175,255,0.1)"
          >
            <Heading size="sm" fontFamily="subheading" fontWeight="400" lineHeight="130%" color="primary">
              {" "}
              News{" "}
            </Heading>
          </CentreBox>
          <ContainerDirection {...containerStyles}>
            {feed && feed.length > 0 ? (
              feed.map((item: FeedPost) => <NewsFeedItem key={item.id} item={item} />)
            ) : (
              <Spinner color="primary" size="lg" />
            )}
          </ContainerDirection>
        </Stack>
      </CentreBox>
    );
  }
);
