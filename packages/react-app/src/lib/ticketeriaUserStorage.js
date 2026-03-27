const STORAGE_PREFIX = "ticketeria:user:";

function getStorageKey(walletAddress) {
  if (!walletAddress) return "";
  return `${STORAGE_PREFIX}${walletAddress.toLowerCase()}`;
}

export function getStoredTicketeriaUser(walletAddress) {
  if (typeof window === "undefined" || !walletAddress) return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(walletAddress));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.isMexican !== "boolean") return null;

    return {
      walletAddress: String(parsed.walletAddress || walletAddress).toLowerCase(),
      curp: String(parsed.curp || ""),
      isMexican: parsed.isMexican,
    };
  } catch (error) {
    console.error("Failed to read ticketeria user from localStorage", error);
    return null;
  }
}

export function setStoredTicketeriaUser(walletAddress, payload) {
  if (typeof window === "undefined" || !walletAddress) return;

  const key = getStorageKey(walletAddress);
  const safePayload = {
    walletAddress: String(walletAddress).toLowerCase(),
    curp: String(payload?.curp || ""),
    isMexican: Boolean(payload?.isMexican),
  };

  window.localStorage.setItem(key, JSON.stringify(safePayload));
}
