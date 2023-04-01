import MagikWidget from "@magiklabs/react-sdk";

export const MagikWidgetOfframp = {
  args: {
    isProdUrl: true,
    defaultCountry: "NG",
    enableDebugLogs: false,
    environment: "staging",
    partnerContext: {},
    onClose: () => {},
    apiKey: "YOUR_API_KEY",
    tokens: [{
      address: '0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a',
      chainId: 'celo',
    }],
    fiatAmount: "30",
    userEmail: undefined,
    primaryColor: "%2300aeff",
    widgetType: "embedded",
    isOfframp: true
  }
}

export default {
  title: "Apps/Magik",
  component: MagikWidget,
};
