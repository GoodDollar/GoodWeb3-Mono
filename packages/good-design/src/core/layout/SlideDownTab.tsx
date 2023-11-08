import React, { useCallback, useState } from "react";
import { Box, Text } from "native-base";

import { CentreBox } from "./CentreBox";
import { BasePressable } from "../buttons";
import { Image } from "../images";
import ArrowTab from "../../assets/svg/arrow-tab.svg";

interface ISlideDownTabProps {
  tabTitle: string;
  children: React.ReactNode;
}

const SlideDownTab = ({ tabTitle, children }: ISlideDownTabProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContent = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);

  return (
    <Box w="100%" mb="4" maxW="363">
      <BasePressable bgColor="tabBlue" onPress={toggleContent} borderRadius="6">
        <CentreBox flexDirection="row" w="100%" justifyContent="space-evenly" h="10">
          <Text color="white" w="80%" fontFamily="subheading">
            {tabTitle}
          </Text>
          <Image src={ArrowTab} w="6" h="6" /> {/* todo: turn arrow around on open */}
        </CentreBox>
      </BasePressable>
      {isOpen && <CentreBox w="100%">{children}</CentreBox>}
    </Box>
  );
};

export default SlideDownTab;
