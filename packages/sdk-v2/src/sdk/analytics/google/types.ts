import { IAbstractConfig } from "../types";

export interface IGoogleConfig extends IAbstractConfig {
  userProperty?: string;
}

export interface IGoogleAPI {
  setDefaultEventParams(params?: object): void;
  setDefaultEventParameters?(params?: { [key: string]: any }): Promise<void>; // firebase
  setUserId(id: string): void;
  setUserProperties(props?: Record<string, any>): void;
  logEvent(event: string, data?: any): void;
}

export const defaultGoogleConfig: Partial<IGoogleConfig> = {
  userProperty: "user"
};
