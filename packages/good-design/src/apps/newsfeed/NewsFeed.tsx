import React, { FC, useCallback, useMemo } from "react";
import { FeedPost } from "@gooddollar/web3sdk-v2";
import { Heading, HStack, Image, Spinner, Stack, Text, useBreakpointValue, VStack } from "native-base";

import { BasePressable } from "../../core";
import SvgXml from "../../core/images/SvgXml";
import { withTheme } from "../../theme";
import { CentreBox } from "../../core/layout/CentreBox";
import { openLink } from "@gooddollar/web3sdk-v2";

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
      <BasePressable onPress={handlePress}>
        <CentreBox flexDir="column" {...props}>
          {picture && (
            <Image
              minW="325"
              width="100%"
              pb="56.25%"
              src={picture}
              alt="Image"
              resizeMode="contain"
              {...pictureStyles}
            />
          )}
          <CentreBox {...containerStyles}>
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

export const NewsFeed = ({ feed }: { feed: FeedPost[] }) => {
  const containerWidth = useBreakpointValue({
    base: "100%",
    xl: "auto"
  });

  const feedWidth = useBreakpointValue({
    base: "75%",
    xl: "95%"
  });

  return (
    <CentreBox flexDir="column" minWidth="325" width={containerWidth}>
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
        <VStack width={feedWidth} ml="auto" mr="auto">
          {feed && feed.length > 0 ? (
            feed.map((item: FeedPost) => <NewsFeedItem key={item.id} item={item} />)
          ) : (
            <Spinner color="primary" size="lg" />
          )}
        </VStack>
      </Stack>
    </CentreBox>
  );
};
