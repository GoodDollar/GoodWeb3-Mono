import { Text, Pressable, ITextProps, View, StyledProps, IPressableProps } from "native-base";
import { IViewProps } from "native-base/lib/typescript/components/basic/View/types";
import React from "react";
import { withTheme } from "../../theme/hoc/withTheme";

type InteractionStyles = {
  [Property in keyof StyledProps]: any;
};

type interactionEvents = "focus" | "hover" | "pressed";

type InterProps = {
  [key in interactionEvents]?: InteractionStyles;
};

export interface BasePressableProps extends IPressableProps {
  /**
   * a text to be rendered in the component.
   */
  text?: string;
  onPress?: () => void;
  innerText?: ITextProps;
  textInteraction?: InterProps;
  viewInteraction?: InterProps;
  innerView?: IViewProps;
  children?: any;
  name?: string;
}

const BasePressable = withTheme({ name: "BasePressable" })(
  ({
    text,
    innerText,
    textInteraction,
    viewInteraction,
    innerView,
    onPress,
    children,
    ...props
  }: BasePressableProps) => {
    const { focus: textFocus, hover: textHover, pressed: textPressed } = textInteraction ?? {};
    const { focus: viewFocus, hover: viewHover, pressed: viewPressed } = viewInteraction ?? {};

    return (
      <Pressable onPress={onPress} {...props}>
        {({ isHovered, isPressed, isFocused }) => (
          <View
            {...innerView}
            {...(isHovered && viewHover)}
            {...(isPressed && viewPressed)}
            {...(isFocused && viewFocus)}
          >
            <Text
              {...innerText}
              {...(isHovered && textHover)}
              {...(isPressed && textPressed)}
              {...(isFocused && textFocus)}
            >
              {text}
            </Text>
            {children}
          </View>
        )}
      </Pressable>
    );
  }
);

export const theme = {
  defaultProps: {},
  variants: {
    arrowIcon: () => ({
      bgColor: "primary:alpha.10",
      w: "306px",
      h: 12,
      shadow: "2",
      innerText: {
        fontSize: "sm",
        fontWeight: "medium",
        fontFamily: "subheading",
        color: "main",
        pt: "1px",
        pb: 0
      },
      innerView: {
        width: "auto",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        pt: "3px",
        pl: 4,
        pr: 0,
        pb: 0,
        flexGrow: 0
      },
      borderRadius: "30px",
      _hover: {
        bgColor: "primary"
      }
    }),
    externalLink: () => ({
      innerView: {
        h: "130px",
        bgColor: "goodWhite.100",
        display: "flex",
        flexDir: "row",
        alignItems: "center",
        justifyContent: "center",
        style: { flexGrow: 1 }
      },
      viewInteraction: {
        hover: {
          bgColor: "goodGrey.300:alpha.30"
        }
      }
    })
  }
};

export default BasePressable;
