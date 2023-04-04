import MagikWidget from "@magiklabs/react-sdk";

export const MagikWidgetOfframp = {
  args: {
    isProdUrl: true,
    defaultCountry: "NG",
    enableDebugLogs: false,
    environment: "production",
    partnerContext: {},
    onClose: () => {},
    apiKey: "r6eMBtUkT2A_aStNmMAfpaOT8fFs0Bew",
    tokens: [{
      address: '0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a',
      chainId: 'celo',
    }, {
      address: '0x765de816845861e75a25fca122bb6898b8b1282a',
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
