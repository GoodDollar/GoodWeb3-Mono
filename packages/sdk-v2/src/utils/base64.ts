const dataUrlRegexp = /^data:(image\/(\w{3,5}));base64,/i;
const dataUrlTmpl = (mime, base64) => `data:${mime};base64,${base64}`;

export const stripBase64 = dataURL => dataURL.substring(dataURL.indexOf(",") + 1);

// on native app FileAPI reads as dataurl incorrectly
// it always sets appplication/octet-stream conenttype
// this function fix the data url by replacing the
// invalid mime with the value we received from the
// Content-Type header of the IPFS gateways's response
export const normalizeDataUrl = (dataURL, mime) => {
  const mimeHeader = dataUrlTmpl(mime, { base64: "" });

  if (dataURL.startsWith(mimeHeader)) {
    return dataURL;
  }

  return mimeHeader + stripBase64(dataURL);
};

export const parseDataUrl = dataURL => {
  const [, mime, extension] = dataUrlRegexp.exec(dataURL) || [];

  return {
    mime,
    extension,
    base64: stripBase64(dataURL)
  };
};
