import { View, Text } from "native-base";
import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";

interface ILayoutProps {
	children: ReactNode
}

export const Layout = ({ children }: ILayoutProps) => <View style={styles.layout}>{children}</View>

export const Title = ({ children }: ILayoutProps) => <Text style={styles.title} color={'#42454A'}>{children}</Text>

const styles = StyleSheet.create({
	layout: {
		maxWidth: 712,
		borderWidth: 1,
		borderColor: 'rgba(208, 217, 228, 0.483146)',
		width: '100%',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 17,
		backgroundColor: '#fff',
		boxShadow: '3px 3px 10px -1px rgba(11, 27, 102, 0.304824)'
	},
	title: {
		fontStyle: 'normal',
		fontWeight: 'bold',
		fontSize: 34,
		lineHeight: 40,
		letterSpacing: -0.02,
	},
})
