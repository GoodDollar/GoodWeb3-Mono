import { default as AsyncStorageRN } from "@react-native-async-storage/async-storage";
import { isArray, isEmpty, isFunction, noop } from "lodash";

import { tryJson } from "./utils";

export class StorageSDK {
  private readonly accessorRe: RegExp = /(get|set)/i;
  private readonly nonAccessorRe: RegExp = /allkeys/i;
  private readonly api: typeof AsyncStorageRN = AsyncStorageRN;

  constructor() {
    return new Proxy(this, {
      get: (target, property) => {
        const { api, accessorRe, nonAccessorRe } = target;
        const propName: string = String(property || "");
        let propertyTarget = api;
        let propertyValue: any;

        // override methods getItem, setItem, multiGet, multiSet
        // do not override getAllKeys
        if (accessorRe.test(propName) && !nonAccessorRe.test(propName)) {
          propertyTarget = this;
        }

        propertyValue = propertyTarget[property];

        if (isFunction(propertyValue)) {
          propertyValue = propertyValue.bind(propertyTarget);
        }

        return propertyValue;
      }
    });
  }

  getAllKeys = this.api.getAllKeys;
  removeItem = this.api.removeItem;
  mergeItem = this.api.mergeItem;
  multiRemove = this.api.multiRemove;
  multiMerge = this.api.multiMerge;
  clear = this.api.clear;
  flushGetRequests = this.api.flushGetRequests;

  safeSet<T = any>(key: string, value: T, onError?: (e: Error) => void): void {
    this.setItem(key, value).catch(onError || noop);
  }

  safeRemove(key: string, onError?: (e: Error) => void): void {
    this.api.removeItem(key).catch(onError || noop);
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);

    await this.api.setItem(key, stringified);
  }

  async getItem<T = any>(key: string): Promise<T> {
    const jsonValue = await this.api.getItem(key);

    return tryJson(jsonValue ?? "") as T;
  }

  async multiSet<T = any>(keyValuePairs: [string, T][]): Promise<void> {
    if (!isArray(keyValuePairs) || isEmpty(keyValuePairs)) {
      return;
    }

    const stringifiedPairs: [string, string][] = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);

    await this.api.multiSet(stringifiedPairs);
  }

  async multiGet<T = any>(keys: readonly string[]): Promise<T> {
    const keyJsonValuePairs = await this.api.multiGet(keys);

    return keyJsonValuePairs.map(([key, jsonValue]) => [key, tryJson(jsonValue ?? "")]) as T;
  }
}

export const AsyncStorage = new StorageSDK();
