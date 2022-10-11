import { View, Text } from "native-base";
import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";

interface ILayoutProps {
	children: ReactNode
}

export const Layout = ({ children }: ILayoutProps) => <View style={styles.layout}>{children}</View>

export const Title = ({ children }: ILayoutProps) => <Text style={styles.title}>{children}</Text>

const styles = StyleSheet.create({
	layout: {
		maxWidth: 712,
		width: '100%',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 17,
	},
	title: {
		fontStyle: 'normal',
		fontWeight: 'bold',
		fontSize: 34,
		lineHeight: 40,
		letterSpacing: -0.02,
	},
})
