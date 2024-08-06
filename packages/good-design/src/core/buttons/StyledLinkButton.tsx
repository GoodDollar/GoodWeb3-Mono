import React from "react";
import { Link, Text } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";

export const LinkButton = withTheme({ name: "LinkButton" })(
  ({ url, buttonText, onPress, ...styleProps }: { buttonText: string; url?: string; onPress?: () => void }) => (
    <Link
      // hover doesn't work in gooddapp for this component because of fixed/older @react-native-aria/interactions package
      _hover={{ bg: "primary:alpha.80" }}
      bg="primary"
      href={url}
      isExternal={onPress ? false : true}
      onPress={onPress}
      isUnderlined={false}
      fontSize="sm"
      color="main"
      borderRadius="24"
      paddingY="10px"
      justifyContent="center"
      w="100%"
      {...styleProps}
    >
      <Text textAlign="center" fontFamily="subheading" color="white" fontSize="sm" fontWeight="700">
        {buttonText}
      </Text>
    </Link>
  )
);
