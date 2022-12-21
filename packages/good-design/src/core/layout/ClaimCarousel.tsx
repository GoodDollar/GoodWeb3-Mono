import { FlatList, View } from "native-base";
import React, { FC, memo, useCallback, useState } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { IClaimCard } from "../buttons";
import ClaimCard from "./ClaimCard";

interface ClaimCarouselProps {
  cards: Array<IClaimCard>;
}

interface SlideMarkProps {
  isActive: boolean;
  isLast: boolean;
}

const SlideMark: FC<SlideMarkProps> = memo(({ isActive, isLast }) => (
  <View h="1" w="5" bg={isActive ? "main" : "grey"} mr={isLast ? "0" : "2"} borderRadius={2} />
));

const ClaimCardItem: FC<{ item: IClaimCard; index: number }> = ({ item, index }) => {
  const isOdd = index % 2 === 0;
  const backgroundColor = isOdd ? "greyCard" : "main";
  const titleColor = isOdd ? "main" : "white";
  const descriptionColor = isOdd ? "lightGrey" : "white";
  return (
    <ClaimCard
      key={index}
      titleColor={titleColor}
      descriptionColor={descriptionColor}
      backgroundColor={backgroundColor}
      {...item}
    />
  );
};

const SlidesComponent = memo(({ activeSlide, slidesNumber }: { activeSlide: number, slidesNumber: number }) => <>
  {Array(slidesNumber)
    .fill(0)
    .map((_, index, arr) => (
      <SlideMark key={index} isActive={index === activeSlide} isLast={index === arr.length - 1} />
    ))}
  </>
);


const getItemLayout = (_: IClaimCard[] | null | undefined, index: number) => ({
  index,
  length: 275,
  offset: (275 + 16) * index
});

const Separator = () => <View w="4" />;

const ClaimCarousel: FC<ClaimCarouselProps> = ({ cards }) => {
  const [slidesNumber, setSlidesNumber] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);

  const onFlatListLayoutChange = useCallback(
    (event: LayoutChangeEvent) => {
      const contentWidth = cards.length * 275 + (cards.length - 1) * 16;

      if (event.nativeEvent.layout.width >= contentWidth) {
        setSlidesNumber(0);
        return;
      }

      setSlidesNumber(Math.ceil((contentWidth - event.nativeEvent.layout.width - 16) / (275 + 16)));
    },
    [cards, setSlidesNumber]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentSlide = Math.floor(event.nativeEvent.contentOffset.x / (275 + 16));

      if (activeSlide === currentSlide) return;

      setActiveSlide(currentSlide);
    },
    [activeSlide, setActiveSlide]
  );

  return (
    <>
      <FlatList
        data={cards}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        mt="8"
        showsHorizontalScrollIndicator={false}
        onLayout={onFlatListLayoutChange}
        getItemLayout={getItemLayout}
        renderItem={ClaimCardItem}
        ItemSeparatorComponent={Separator}
        pagingEnabled
      />

      <View flexDirection="row" w="full" pt="5" justifyContent="center">
        <SlidesComponent activeSlide={activeSlide} slidesNumber={slidesNumber} />
      </View>
    </>
  );
};

export default ClaimCarousel;
