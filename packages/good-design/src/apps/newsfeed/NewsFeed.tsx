import React, { useMemo } from "react";
import { FeedPost } from "@gooddollar/web3sdk-v2";
import { Heading, Spinner, Stack, Text, useBreakpointValue, VStack } from "native-base";

import SvgXml from "../../core/images/SvgXml";
import { CentreBox } from "../../core/layout/CentreBox";
import ImageCard from "../../core/layout/ImageCard";

const NewsCardContent = ({ content }: { content: any }) => (
  <Text
    color="goodGrey.400"
    fontFamily="subheading"
    fontSize="2xs"
    fontWeight="400"
    lineHeight="130%"
    paddingBottom={2}
    maxWidth={400}
  >
    {content}
  </Text>
);

const NewsCardFooter = ({ published, sponsored_logo }: { published: string; sponsored_logo: string }) => {
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

  return (
    <>
      <Text marginRight="auto" fontSize="4xs">
        {formattedPublished}
      </Text>
      <CentreBox marginLeft="auto">
        {sponsored_logo && <SvgXml src={sponsored_logo} height="28" width="45" />}
      </CentreBox>
    </>
  );
};

const NewsCardWrapper = ({ item }: { item: FeedPost }) => {
  const { picture, title, content, published, sponsored_logo, link } = item;

  return (
    <ImageCard
      variant="news-card"
      picture={picture}
      title={title}
      link={link}
      content={<NewsCardContent content={content} />}
      footer={<NewsCardFooter published={published} sponsored_logo={sponsored_logo} />}
      shadow={1}
      borderLeftWidth="10px"
      borderLeftColor="main"
      borderRadius={6}
      containerStyles={{
        paddingTop: 2,
        paddingX: 2,
        width: "100%",
        alignItems: "flex-start"
      }}
    />
  );
};

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
            feed.map((item: FeedPost) => <NewsCardWrapper key={item.id} item={item} />)
          ) : (
            <Spinner color="primary" size="lg" />
          )}
        </VStack>
      </Stack>
    </CentreBox>
  );
};
