// web only implementation
import { decode as atob } from "base-64";

import uuid from "./uuid";
import { parseDataUrl } from "./base64";

// eslint-disable-next-line require-await
export const withTemporaryFile = async (dataUrl, callback) => {
  const { mime, extension, base64 } = parseDataUrl(dataUrl);
  const filename = `${uuid()}.${extension}`;

  const binary = atob(base64);
  let offset = binary.length;
  const buffer = new Uint8Array(offset);

  while (offset--) {
    buffer[offset] = binary.charCodeAt(offset);
  }

  return callback(new File([buffer], filename, { type: mime }));
};

const readFile = (file: any, format: "text" | "dataurl", encoding = "UTF-8") =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    switch (format) {
      case "text":
        reader.readAsText(file, encoding);
        break;
      case "dataurl":
        reader.readAsDataURL(file);
        break;
      default:
        throw new Error("Invalid format specified");
    }
  });

export const readAsDataURL = (file: any) => readFile(file, "dataurl");

export const readAsText = (file: any, encoding = "UTF-8") => readFile(file, "text", encoding);
