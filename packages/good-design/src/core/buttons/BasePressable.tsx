import { Text, Pressable, ITextProps, View, StyledProps, IPressableProps, IButtonProps } from "native-base";
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

export interface BasePressableProps extends IPressableProps, Pick<IButtonProps, "variant"> {
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
      w: 306,
      h: 52,
      shadow: "2",
      innerText: {
        fontSize: "sm",
        fontWeight: "medium",
        fontFamily: "subheading",
        color: "main"
      },
      innerView: {
        width: 300,
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
    })
  }
};

export default BasePressable;
