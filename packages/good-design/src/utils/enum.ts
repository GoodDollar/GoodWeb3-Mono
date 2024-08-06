/**
 * Enum are bi-directional only when it's indexed by number.
 * Use this to get the key of an enum by its value when key is not a number.
 */
export const getKeyByValue = <T extends { [index: string]: string }>(enumObj: T, value: string): keyof T | null => {
  for (const [key, enumValue] of Object.entries(enumObj)) {
    if (enumValue === value) {
      return key as keyof T;
    }
  }
  return null;
};
