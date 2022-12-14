import { FlatList, View } from "native-base";
import React, { FC, useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { IClaimCard } from "../buttons";
import ClaimCard from "./ClaimCard";

interface ClaimCarouselProps {
  cards: Array<IClaimCard>;
}

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

  const slidesComponent = useMemo(
    () =>
      Array(slidesNumber)
        .fill(0)
        .map((_, index, arr) => (
          <View
            key={index}
            h="1"
            w="5"
            bg={index === activeSlide ? "main" : "#FFFFFF20"}
            mr={index === arr.length - 1 ? "0" : "2"}
            borderRadius={2}
          />
        )),
    [slidesNumber, activeSlide]
  );

  return (
    <>
      <FlatList
        data={cards}
        horizontal
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onLayout={onFlatListLayoutChange}
        getItemLayout={(_, index) => ({ index, length: 275, offset: (275 + 16) * index })}
        renderItem={({ item, index }) => {
          const isOdd = index % 2 === 0;
          const backgroundColor = isOdd ? "#F6F8FA" : "main";
          const titleColor = isOdd ? "main" : "white";
          const descriptionColor = isOdd ? "#636363" : "white";
          return (
            <ClaimCard
              titleColor={titleColor}
              descriptionColor={descriptionColor}
              backgroundColor={backgroundColor}
              {...item}
            />
          );
        }}
        ItemSeparatorComponent={() => <View w="4" />}
        pagingEnabled
      />

      <View flexDirection="row" w="full" pt="5" justifyContent="center">
        {slidesComponent}
      </View>
    </>
  );
};

export default ClaimCarousel;
