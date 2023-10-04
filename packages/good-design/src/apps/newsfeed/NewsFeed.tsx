import React, { FC } from "react";
import { FeedPost } from "@gooddollar/web3sdk-v2";
import { Heading, HStack, Image, Stack, Text, VStack } from "native-base";

import SvgXml from "../../core/images/SvgXml";
import { withTheme } from "../../theme";
import { CentreBox } from "../../core/layout/CentreBox";

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
  }) => {
    const { picture, title, content, published, sponsored_logo } = item;
    const formattedPublished = new Date(published).toLocaleDateString("en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    return (
      <CentreBox flexDir="column" {...props}>
        {picture && <Image width="100%" height="190px" src={picture} alt="Image" {...pictureStyles} />}
        <CentreBox {...containerStyles}>
          <Text {...titleStyles}>{title}</Text>
          <Text {...contentStyles}>{content}</Text>
          <HStack {...footerStyles}>
            <Text {...publishedStyles}>{formattedPublished}</Text>
            {sponsored_logo && <SvgXml src={sponsored_logo} height="28" width="45" {...sponsoredStyles} />}
          </HStack>
        </CentreBox>
      </CentreBox>
    );
  }
);

export const NewsFeed = ({ feed }: FeedPost[]) => {
  return (
    <CentreBox flexDir="column">
      <Stack maxW={400}>
        <CentreBox variant="shadowedBanner">
          <Heading size="sm" fontFamily="subheading" fontWeight="400" lineHeight="130%" color="primary">
            {" "}
            News{" "}
          </Heading>
        </CentreBox>
        <VStack width="95%" ml="auto" mr="auto">
          {feed && feed.map((item: FeedPost) => <NewsFeedItem item={item} />)}
        </VStack>
      </Stack>
    </CentreBox>
  );
};
