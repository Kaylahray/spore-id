export const WALLET_REFRESH_EVENT = "sporeid:wallet-refresh";

export function requestWalletRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
}
