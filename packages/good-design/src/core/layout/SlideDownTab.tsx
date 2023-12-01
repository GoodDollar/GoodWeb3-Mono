import React, { useCallback, useState } from "react";
import { Box, Text } from "native-base";

import { CentreBox } from "./CentreBox";
import { BasePressable } from "../buttons";
import { Image } from "../images";
import ArrowTab from "../../assets/svg/arrow-tab.svg";
import ArrowTabLight from "../../assets/svg/arrow-tab-light.svg";

interface ISlideDownTabProps {
  tabTitle: string;
  arrowSmall?: boolean;
  styles?: {
    container?: any;
    button?: any;
    content?: any;
  };
  children: React.ReactNode;
}

const SlideDownTab = ({ tabTitle, arrowSmall, styles, children }: ISlideDownTabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { button, container, content } = styles ?? {};

  const toggleContent = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);

  const arrowStyles = isOpen ? { transform: [{ rotateZ: "180deg" }] } : {};

  const Arrow = arrowSmall ? ArrowTabLight : ArrowTab;
  const arrowSize = arrowSmall ? "4" : "6";

  return (
    <Box w="100%" mb="4" maxW="363" style={container}>
      <BasePressable bgColor={isOpen ? "primary" : "tabBlue"} onPress={toggleContent} borderRadius="6" style={button}>
        <CentreBox flexDirection="row" w="100%" justifyContent="space-evenly" h="10">
          <Text color="white" w="80%" fontFamily="subheading">
            {tabTitle}
          </Text>
          <Image src={Arrow} w={arrowSize} h={arrowSize} style={arrowStyles} />
        </CentreBox>
      </BasePressable>
      {isOpen && (
        <CentreBox w="100%" style={content}>
          {children}
        </CentreBox>
      )}
    </Box>
  );
};

export default SlideDownTab;
