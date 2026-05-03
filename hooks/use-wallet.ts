"use client";

import { useEffect, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";
import { WALLET_REFRESH_EVENT } from "@/lib/wallet-refresh";

export function useWallet() {
  const { open, disconnect, wallet } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  const refreshWallet = async () => {
    if (!signer) {
      setAddress("");
      setBalance("");
      return;
    }
    try {
      const addr = await signer.getRecommendedAddress();
      setAddress(addr);

      const capacity = await signer.getBalance();
      setBalance(ccc.fixedPointToString(capacity));
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : String(error);
      if (message.includes("connection closed")) {
        return;
      }
      console.error("Failed to fetch wallet data:", error);
    }
  };

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance("");
      return;
    }
    void refreshWallet();
  }, [signer]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      void refreshWallet();
    };
    window.addEventListener(WALLET_REFRESH_EVENT, handler);
    return () => {
      window.removeEventListener(WALLET_REFRESH_EVENT, handler);
    };
  }, [signer]);

  const formattedAddress = useMemo(() => {
    if (!address) {
      return "";
    }

    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  return {
    connect: open,
    disconnect,
    wallet,
    signer,
    address,
    balance,
    formattedAddress,
    isConnected: !!wallet,
    refreshWallet,
  };
}
