import React, { memo } from "react";
import { Box, Text } from "native-base";
import { Title } from "./";

interface ActionHeaderProps {
  textColor: any;
  /** text to complete the 'To complete this action, ...' copy */
  actionText: string;
}

const ActionHeader = memo(({ textColor, actionText }: ActionHeaderProps) => (
  <Box backgroundColor={"white"}>
    <Title fontSize="xl" mb="2" fontWeight="bold" lineHeight="36px">
      Action Required
    </Title>
    <Text color={textColor} fontFamily="subheading" fontWeight="normal" fontSize="md">
      To complete this action, {actionText}.
    </Text>
  </Box>
));

export default ActionHeader;
