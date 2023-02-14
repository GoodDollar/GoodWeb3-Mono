import { Mixpanel } from "mixpanel-react-native";
interface MixPanelNative extends Mixpanel {
    setUserProps(props: any): void;
    setUserPropsOnce(props: any): void;
}
export declare const MixpanelAPI: {
    init(apiKey: any): Promise<MixPanelNative>;
};
export {};
//# sourceMappingURL=api.native.d.ts.map