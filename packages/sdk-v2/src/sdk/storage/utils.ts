import { isArray, isEmpty } from "lodash";

export function tryJson<T = any>(source: string): T | null | string {
  if (source === null) {
    return null
  }

  try {
    return JSON.parse(source)
  } catch {
    return source
  }
}

export function stringifyPairs<T = any>(keyValuePairs: [string, T][]): [string, string][] | undefined {
  if (!isArray(keyValuePairs) || isEmpty(keyValuePairs)) {
    return;
  }

  return keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
}
