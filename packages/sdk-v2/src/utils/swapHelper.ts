export const swapHelper = async (account: string) => {
  const tx = fetch(`https://good-server.herokuapp.com/verify/swaphelper`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ account })
  });

  return tx;
};
