import { IAbstractProvider, IAnalyticsProvider, IAppProps, IAbstractConfig } from "../types";
export interface IMixpanelAPI {
    init(...params: any[]): void;
    registerSuperProperties(...params: any[]): void;
    registerSuperPropertiesOnce(...params: any[]): void;
    identify(...params: any[]): void;
    track(...params: any[]): void;
    setUserProps(props: any): void;
    setUserPropsOnce(props: any): void;
}
export interface IMixpanelConfig extends IAbstractConfig {
    apiKey?: string;
}
export declare class Mixpanel implements IAbstractProvider, IAnalyticsProvider {
    private config;
    private api;
    constructor(config: IMixpanelConfig);
    initialize(appProps: IAppProps): Promise<boolean>;
    identify(identifier: string | number, email?: string, props?: object): void;
    send(event: string, data?: object): void;
}
//# sourceMappingURL=mixpanel.d.ts.map