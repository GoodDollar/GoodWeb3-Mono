import React from "react";
import { Button as NBButton, Factory, IButtonProps } from "native-base";
import { withTheme } from "../../theme/hoc/withTheme";

interface IBasicButtonProps extends IButtonProps {
  text: string;
  onPress: () => {};
}

const ButtonAction = ({ text, ...props }: IBasicButtonProps) => {
  const Button = Factory(NBButton, theme)
  return <Button {...props}>{text}</Button>
};

export const theme = {
  defaultProps: {},
  baseStyle: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: "100%",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    cursor: "pointer",
    fontStyle: "normal",
    lineHeight: "16px",
    userSelect: "none",
    transition: "background 0.25s",
    backgroundColor: "#00B0FF",
    height: 71,
    boxShadow: "3px 3px 10px -1px rgba(11, 27, 102, 0.304824)",
    fontWeight: 900,
    fontSize: 20
  }
};

export default withTheme()(ButtonAction);
