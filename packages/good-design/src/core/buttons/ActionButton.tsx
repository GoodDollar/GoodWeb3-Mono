
import { StyleSheet } from "react-native";
import { Button, IButtonProps } from "native-base";
import React from "react";

interface IBasicButtonProps extends IButtonProps {
	text: string
}

export const ButtonAction = ({ text, ...props }: IBasicButtonProps) => {
	return <Button { ...props } style={styles.buttonAction}>{text}</Button>
}

const styles = StyleSheet.create({
	buttonAction: {
		alignItems: "center",
		justifyContent: "center",
		minWidth: "100%",
		paddingVertical: 5,
		paddingHorizontal: 5,
		borderRadius: 20,
		cursor: "pointer",
		fontStyle: "normal",
		lineHeight: "16px",
		textAlign: "center",
		textTransform: "capitalize",
		userSelect: "none",
		transition: "background 0.25s",
		backgroundColor: "#00B0FF",
		height: 71,
		boxShadow: '3px 3px 10px -1px rgba(11, 27, 102, 0.304824)',
		fontWeight: 900,
		fontSize: 20,
	}
})
