export const isTxReject = ({ message, code }: { message: string; code?: number }) =>
  message === "user rejected transaction" || code === 4001;
