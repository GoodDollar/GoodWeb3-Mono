export const getTransactionErrorMessage = (error: any): string => {
  return (
    error?.error?.data?.message ||
    error?.error?.message ||
    error?.reason ||
    error?.data?.message ||
    error?.message ||
    "Transaction failed"
  );
};

export const isTransientBlockReadError = (error: any): boolean => {
  const message = getTransactionErrorMessage(error).toLowerCase();

  return message.includes("unknown block") || message.includes("no block");
};
