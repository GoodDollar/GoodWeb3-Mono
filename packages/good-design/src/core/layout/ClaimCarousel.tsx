import { FlatList, View, Box, useBreakpointValue, Pressable } from "native-base";
import React, { FC, memo, useCallback, useState, useMemo, useRef } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { IClaimCard } from "../buttons";
import ClaimCard from "./ClaimCard";

interface ClaimCarouselProps {
  cards: Array<IClaimCard>;
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

const Separator = () => <View w="5" />;

const ClaimCarousel: FC<ClaimCarouselProps> = ({ cards, claimed }) => {
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

  const onFlatListLayoutChange = useCallback(
    (event: LayoutChangeEvent) => {
      const contentWidth = activeCards.length * 275 + (activeCards.length - 1) * 20;
      const layoutWidth = event.nativeEvent.layout.width;
      setActiveContentWidth(contentWidth);
      if (layoutWidth >= contentWidth) {
        setSlidesNumber(0);
        return;
      }
      const slides =
        layoutWidth >= 480 ? Math.ceil((contentWidth - layoutWidth + 36) / (275 + 20)) : activeCards.length;
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

  const clickAndSlide = useCallback(() => {
    if (!flatListRef.current) return;
    const isLast = activeSlide === slidesNumber - 1;
    flatListRef.current.scrollToOffset({
      animated: true,
      index: isLast ? 0 : activeSlide + 1,
      offset: isLast ? 0 : layoutOffset + 275
    });
  }, [activeSlide, flatListRef, onScroll, slidesNumber, layoutOffset, activeCards]);

  const getFlatListRef = useCallback(
    flatList => {
      flatListRef.current = flatList;
    },
    [activeSlide, onScroll, clickAndSlide]
  );

  return (
    <Box>
      <FlatList
        _contentContainerStyle={{
          width: contentWidth
        }}
        //@ts-ignore
        ref={getFlatListRef}
        data={activeCards}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialScrollIndex={0}
        h="425"
        w="auto"
        showsHorizontalScrollIndicator={false}
        onLayout={onFlatListLayoutChange}
        getItemLayout={getItemLayout}
        renderItem={ClaimCardItem}
        ItemSeparatorComponent={Separator}
        pagingEnabled
      />

      <View flexDirection="row" pt="5" justifyContent="center">
        <Pressable
          onPress={clickAndSlide}
          flexDir="row"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="15px"
        >
          <SlidesComponent data={activeCards} activeSlide={activeSlide} slidesNumber={slidesNumber} />
        </Pressable>
      </View>
    </Box>
  );
};

export default ClaimCarousel;
