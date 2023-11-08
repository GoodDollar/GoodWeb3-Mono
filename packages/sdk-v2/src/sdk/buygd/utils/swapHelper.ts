export const swapHelper = async (account: string) =>
  fetch(`https://good-server.herokuapp.com/verify/swaphelper`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ account })
  });
