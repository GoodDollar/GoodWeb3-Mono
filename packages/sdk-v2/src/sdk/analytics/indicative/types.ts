import { IAbstractConfig } from "../types";

export interface IIndicativeConfig extends IAbstractConfig {
  apiKey?: string;
  userProperty?: string;
}

export interface IIndicativeApi {
  initialize(apiKey: string): Promise<boolean>;
  addProperties(props: object): void;
  setUniqueID(id: string): void;
  buildEvent(eventName: string, props?: object);
}

export const defaultIndicativeConfig: Partial<IIndicativeConfig> = {
  userProperty: "user"
};
