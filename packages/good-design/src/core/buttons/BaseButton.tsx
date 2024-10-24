import { IButtonProps, ITextProps, View } from "native-base";
import { IViewProps } from "native-base/lib/typescript/components/basic/View/types";
import React from "react";

import { GoodButton, TransText } from "../";
import { withTheme } from "../../theme/hoc/withTheme";

export interface BaseButtonProps extends IButtonProps {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  onPress?: () => void;
  innerText?: ITextProps;
  innerView?: IViewProps;
  children?: any;
  name?: string;
}

const BaseButton = withTheme({ name: "BaseButton" })(
  ({ text, innerText, innerView, onPress, children, ...props }: BaseButtonProps) => (
    <GoodButton onPress={onPress} _text={{ color: "gdPrimary" }} variant="standard-blue" {...props}>
      <View {...innerView}>
        {text ? <TransText t={text} {...innerText} /> : null}
        {children}
      </View>
    </GoodButton>
  )
);

export const theme = {
  defaultProps: {},
  baseStyle: () => {
    return {
      maxWidth: 750,
      backgroundColor: "white",
      _hover: {
        bg: "gdPrimary:alpha.80"
      },
      innerText: {
        fontWeight: "hairline",
        color: "white"
      }
    };
  },
  variants: {
    "standard-blue": () => ({
      innerView: {
        backgroundColor: "gdPrimary",
        borderRadius: 24,
        width: 343,
        textAlign: "center"
      },
      innerText: {
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "bold",
        textTransform: "uppercase"
      }
    }),
    "link-like": () => ({
      innerView: {
        backgroundColor: "none",
        paddingY: 0,
        paddingX: 8,
        width: 343,
        textAlign: "center"
      },
      innerText: {
        fontFamily: "subheading",
        fontSize: "sm",
        fontWeight: "700",
        lineHeight: 20.8,
        color: "goodGrey.400",
        underline: true,
        textTransform: "uppercase"
      }
    })
  }
};

export default BaseButton;
