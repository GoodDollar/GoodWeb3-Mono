import React, { useMemo } from "react";
import { FeedPost } from "@gooddollar/web3sdk-v2";
import { Heading, Spinner, Stack, Text } from "native-base";
import { Trans } from "@lingui/react";

import { withTheme } from "../../theme/hoc/withTheme";
import SvgXml from "../../core/images/SvgXml.web";
import { CentreBox } from "../../core/layout/CentreBox";
import ImageCard from "../../core/layout/ImageCard";
import { IHStackProps } from "native-base/lib/typescript/components/primitives/Stack/HStack";
import { IVStackProps } from "native-base/lib/typescript/components/primitives/Stack/VStack";

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
      borderLeftColor="gdPrimary"
      borderRadius={6}
    />
  );
};

export const NewsFeed = withTheme({ name: "NewsFeed", skipProps: "feed" })(
  ({
    feed,
    direction,
    styles = {}
  }: { feed: FeedPost[]; direction: "row" | "column"; styles?: { item?: object } } & IHStackProps & IVStackProps) => {
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
            <Heading size="sm" fontFamily="subheading" fontWeight="400" lineHeight="130%" color="gdPrimary">
              <Trans id="News" />
            </Heading>
          </CentreBox>
          <Stack {...{ direction }} {...styles.item}>
            {feed && feed.length > 0 ? (
              feed.map((item: FeedPost) => <NewsCardWrapper key={item.id} item={item} />)
            ) : (
              <Spinner color="gdPrimary" size="lg" />
            )}
          </Stack>
        </Stack>
      </CentreBox>
    );
  }
);
