// If you need to add font which not belong to NativeBase built-in fonts
// you should add it on app side directly, and after that configure it in customFonts

export const customFonts = {
	Graphie: {
		100: {
			normal: "Graphie-ExtraLight",
			italic: "Graphie-ExtraLightItalic",
		},
		200: {
			normal: "Graphie-ExtraLight",
			italic: "Graphie-ExtraLightItalic",
		},
		300: {
			normal: "Graphie-Light",
			italic: "Graphie-LightItalic",
		},
		400: {
			normal: "Graphie-Thin",
			italic: "Graphie-ThinItalic",
		},
		500: {
			normal: "Graphie-Regular",
			italic: "Graphie-RegularItalic",
		},
		600: {
			normal: "Graphie-Regular",
			italic: "Graphie-RegularItalic",
		},
		700: {
			normal: 'Graphie-Bold',
			italic: 'Graphie-BoldItalic',
		},
	}
}

export const nativeBaseFonts = {
	Roboto: {
		100: {
			normal: 'Roboto-Light',
			italic: 'Roboto-LightItalic',
		},
		200: {
			normal: 'Roboto-Light',
			italic: 'Roboto-LightItalic',
		},
		300: {
			normal: 'Roboto-Light',
			italic: 'Roboto-LightItalic',
		},
		400: {
			normal: 'Roboto-Regular',
			italic: 'Roboto-Italic',
		},
		500: {
			normal: 'Roboto-Medium',
		},
		600: {
			normal: 'Roboto-Medium',
			italic: 'Roboto-MediumItalic',
		},
		700: {
			normal: 'Roboto-Bold',
		},
		800: {
			normal: 'Roboto-Bold',
			italic: 'Roboto-BoldItalic',
		},
		900: {
			normal: 'Roboto-Bold',
			italic: 'Roboto-BoldItalic',
		},
	}
}

export default { ...customFonts, ...nativeBaseFonts }
