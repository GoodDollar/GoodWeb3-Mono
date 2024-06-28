export let config = {
  graphKey: ""
};

export const setConfig = (newConfig: { graphKey: string }) => {
  config = { ...newConfig };
};
