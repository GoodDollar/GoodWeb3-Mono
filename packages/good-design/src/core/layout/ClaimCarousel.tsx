import { FlatList, View } from "native-base";
import React, { FC, useCallback, useState } from "react";
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
              key={index}
              titleColor={titleColor}
              descriptionColor={descriptionColor}
              backgroundColor={backgroundColor}
              {...item}
            />
          );
        }}
        ItemSeparatorComponent={() => <View w="16px" />}
        pagingEnabled
      />

      <View flexDirection="row" w="full" pt="20px" justifyContent="center">
        {Array(slidesNumber)
          .fill(0)
          .map((_, index, arr) => (
            <View
              key={index}
              h="4px"
              w="20px"
              bg={index === activeSlide ? "main" : "#FFFFFF20"}
              mr={index === arr.length - 1 ? "0" : "8px"}
              borderRadius="2px"
            />
          ))}
      </View>
    </>
  );
};

export default ClaimCarousel;
