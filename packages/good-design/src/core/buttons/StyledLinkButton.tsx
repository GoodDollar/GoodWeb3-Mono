import React from "react";
import { Link } from "native-base";

import { withTheme } from "../../theme/hoc/withTheme";
import { TransText } from "../";

export const LinkButton = withTheme({ name: "LinkButton" })(
  ({ url, buttonText, onPress, ...styleProps }: { buttonText: string; url?: string; onPress?: () => void }) => (
    <Link
      // hover doesn't work in gooddapp for this component because of fixed/older @react-native-aria/interactions package
      _hover={{ bg: "gdPrimary:alpha.80" }}
      bg="gdPrimary"
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
      <TransText
        t={buttonText}
        textAlign="center"
        fontFamily="subheading"
        color="white"
        fontSize="sm"
        fontWeight="700"
      />
    </Link>
  )
);
