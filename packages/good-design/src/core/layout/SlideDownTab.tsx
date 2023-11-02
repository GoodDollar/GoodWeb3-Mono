import React, { memo, useCallback, useState } from "react";
import { Box, Text } from "native-base";

import { CentreBox } from "./CentreBox";
import { BasePressable } from "../buttons";

const SlideDownArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.6296 8.16485L5.1999 14.7953C4.79869 15.2091 5.04189 16 5.5703 16L18.4297 16C18.9581 16 19.2013 15.2091 18.8001 14.7953L12.3704 8.16485C12.1573 7.94505 11.8427 7.94505 11.6296 8.16485Z"
      fill="#FAFAFA"
    />
  </svg>
);

interface ISlideDownTabProps {
  tabTitle: string;
  children: React.ReactNode;
}

const SlideDownTab = memo(({ tabTitle, children }: ISlideDownTabProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleContent = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <Box w="100%">
      <BasePressable bgColor="tabBlue" onPress={toggleContent} borderRadius="2">
        <CentreBox flexDirection="row" w="100%" justifyContent="space-evenly" h="10">
          <Text color="white" w="80%" fontFamily="subheading">
            {tabTitle}
          </Text>
          <SlideDownArrow /> {/* todo: turn arrow around on open */}
        </CentreBox>
      </BasePressable>
      {isOpen && <CentreBox w="100%">{children}</CentreBox>}
    </Box>
  );
});

export default SlideDownTab;
