export async function saveAttemptWithAuth({
  endpoint,
  payload,
  refreshAccessToken,
  performLogout,
  debugLabel = "saveDailyGameResult",
}) {
  const doPost = async () =>
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

  try {
    let res = await doPost();

    if (res.status === 401) {
      await refreshAccessToken();
      res = await doPost();
    }

    if (!res.ok) throw new Error(res.statusText);

    return await res.json();
  } catch (err) {
    console.error(`[${debugLabel}]`, err);
    performLogout();
    throw err;
  }
}
