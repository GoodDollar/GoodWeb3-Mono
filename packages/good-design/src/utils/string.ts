export const truncateMiddle = (string = "", maxLength: null | number = null, ellipsis = "...") => {
  if (!maxLength || !string) {
    return string;
  }

  const halfLength = Math.floor((maxLength - ellipsis.length) / 2);
  const firstHalf = string.slice(0, halfLength);
  const lastHalf = string.slice(-halfLength);

  return firstHalf + ellipsis + lastHalf;
};
