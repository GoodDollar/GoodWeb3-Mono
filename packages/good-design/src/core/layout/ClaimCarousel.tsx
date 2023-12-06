import { FlatList, View, Box, useBreakpointValue, Pressable } from "native-base";
import React, { FC, memo, useCallback, useState, useMemo, useRef, useEffect } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { CentreBox } from "./CentreBox";
import { IClaimCard } from "../buttons";
import ClaimCard from "./ClaimCard";
import ArrowLeft from "../../assets/svg/arrow-left.svg";
import ArrowRight from "../../assets/svg/arrow-right.svg";
import SvgXml from "../../core/images/SvgXml";

interface ClaimCarouselProps {
  cards: Array<IClaimCard>;
  isMobile: boolean;
  claimed?: boolean;
}

interface SlideMarkProps {
  isActive: boolean;
  isLast: boolean;
}

const SlideMark: FC<SlideMarkProps> = memo(({ isActive, isLast }) => (
  <View h="1" w="5" bg={isActive ? "main" : "grey"} mr={isLast ? "0" : "2"} borderRadius={2} />
));

const ClaimCardItem: FC<{ item: IClaimCard; index: number }> = ({ item, index }) => {
  return <ClaimCard key={index} {...item} />;
};

const SlidesComponent = memo(
  ({ activeSlide, slidesNumber, data }: { activeSlide: number; slidesNumber: number; data: IClaimCard[] }) => (
    <>
      {Array(slidesNumber)
        .fill(0)
        .map((_, index, arr) => (
          <SlideMark key={data[index]?.id} isActive={index === activeSlide} isLast={index === arr.length - 1} />
        ))}
    </>
  )
);

const getItemLayout = (_: IClaimCard[] | null | undefined, index: number) => ({
  index,
  length: 275,
  offset: (275 - 20) * index
});

const Separator = () => <View w="5" h={4} />;

const ClaimCarousel: FC<ClaimCarouselProps> = ({ cards, claimed, isMobile }) => {
  const [slidesNumber, setSlidesNumber] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeContentWidth, setActiveContentWidth] = useState<string | number>("auto");
  const flatListRef = useRef<any>();
  const [layoutOffset, setLayoutOffset] = useState(0);

  const activeCards = useMemo(() => cards.filter(card => !card.hide), [cards, claimed]);

  const contentWidth = useBreakpointValue({
    base: activeContentWidth,
    xl: claimed ? "auto" : activeContentWidth
  });

  //start-hotfix: on mobile flatListLayout only updates on initial mount
  // so we need to handle the slidesnumber change after claim sets manually
  const updateSlidesNumber = useCallback(() => {
    setSlidesNumber(activeCards.length);
  }, [activeCards, claimed, slidesNumber]);

  useEffect(() => {
    if (isMobile) {
      updateSlidesNumber();
    }
  }, [/* used */ claimed]);
  // end-of-hotfix

  const onFlatListLayoutChange = useCallback(
    (event: LayoutChangeEvent) => {
      const contentWidth = activeCards.length * 275 + (activeCards.length - 1) * 20;
      const layoutWidth = event.nativeEvent.layout.width;
      setActiveContentWidth(contentWidth);
      if (layoutWidth >= contentWidth) {
        setSlidesNumber(0);
        return;
      }
      const slides = isMobile ? activeCards.length : Math.ceil((contentWidth - layoutWidth + 36) / (275 + 20));
      setSlidesNumber(slides);
    },
    [activeCards, setSlidesNumber]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offSetX = event.nativeEvent.contentOffset.x;
      const currentSlide = Math.floor(offSetX / (275 + (offSetX === 0 ? 20 : -20)));
      setLayoutOffset(offSetX);

      if (activeSlide === currentSlide) return;

      setActiveSlide(currentSlide);
    },
    [activeSlide, setActiveSlide]
  );

  const casRight = useCallback(() => {
    if (!flatListRef.current) {
      return;
    }

    const isLast = activeSlide === slidesNumber - 1;

    flatListRef.current.scrollToOffset({
      animated: true,
      index: isLast ? 0 : activeSlide + 1,
      offset: isLast ? 0 : layoutOffset + 275
    });
  }, [activeSlide, flatListRef, onScroll, slidesNumber, layoutOffset, activeCards]);

  const casLeft = useCallback(() => {
    if (!flatListRef.current) {
      return;
    }

    const isFirst = activeSlide === 0;

    flatListRef.current.scrollToOffset({
      animated: true,
      index: isFirst ? slidesNumber - 1 : activeSlide - 1,
      offset: isFirst ? layoutOffset + (slidesNumber - 1) * 275 : layoutOffset - 275
    });
  }, [activeSlide, flatListRef, onScroll, slidesNumber, layoutOffset, activeCards]);

  const getFlatListRef = useCallback(
    (flatList: any) => {
      flatListRef.current = flatList;
    },
    [activeSlide, onScroll, casLeft, casRight]
  );

  return (
    <Box style={{ alignSelf: "flex-start", width: "100%" }}>
      <FlatList
        _contentContainerStyle={{
          width: contentWidth
        }}
        // @ts-ignore
        ref={getFlatListRef}
        data={activeCards}
        {...(isMobile && { horizontal: true })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialScrollIndex={0}
        h={isMobile ? 320 : "max-content"}
        w={isMobile ? "auto" : 650}
        showsHorizontalScrollIndicator={false}
        onLayout={onFlatListLayoutChange}
        getItemLayout={getItemLayout}
        renderItem={ClaimCardItem as any}
        ItemSeparatorComponent={Separator}
        pagingEnabled
      />
      {isMobile && (
        <View flexDirection="row" pt={4} justifyContent="center">
          <CentreBox flexDir="row" height="15">
            <Pressable onPress={casLeft} height="6">
              <SvgXml src={ArrowLeft} height="24" width="24" style={{ marginRight: 12 }} />
            </Pressable>

            <SlidesComponent data={activeCards} activeSlide={activeSlide} slidesNumber={slidesNumber} />
            <Pressable onPress={casRight} height="6">
              <SvgXml src={ArrowRight} height="24" width="24" style={{ marginLeft: 12 }} />
            </Pressable>
          </CentreBox>
        </View>
      )}
    </Box>
  );
};

export default ClaimCarousel;
