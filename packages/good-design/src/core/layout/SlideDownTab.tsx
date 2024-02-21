import React, { useCallback, useState } from "react";
import { Box, Text } from "native-base";

import { CentreBox } from "./CentreBox";
import { BasePressable } from "../buttons";
import { Image } from "../images";
import ArrowTabLight from "../../assets/svg/arrow-tab-light.svg";
import ArrowTabBlue from "../../assets/svg/arrow-tab-blue.svg";

interface ISlideDownTabProps {
  tabTitle: string;
  arrowSmall?: boolean;
  styles?: {
    container?: any;
    button?: any;
    content?: any;
    titleFont?: any;
  };
  children: React.ReactNode;
  [key: string]: any;
}

const SlideDownTab = ({ tabTitle, styles, children, ...props }: ISlideDownTabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { button, container, content, titleFont } = styles ?? {};

  const toggleContent = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);

  const Arrow = isOpen ? ArrowTabLight : ArrowTabBlue;
  const arrowSize = "4";

  return (
    <Box w="100%" maxW="363" style={container}>
      <BasePressable
        {...(isOpen && { bgColor: "primary" })}
        onPress={toggleContent}
        borderRadius="6"
        style={button}
        {...props}
      >
        <CentreBox flexDirection="row" w="100%" justifyContent="space-between" h="10" paddingRight={4}>
          <Text color={isOpen ? "white" : "goodGrey.700"} w="80%" {...titleFont}>
            {tabTitle}
          </Text>
          <Image src={Arrow} w={arrowSize} h={arrowSize} />
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
