"use client";

import { useEffect, useMemo, useState } from "react";
import { ccc } from "@ckb-ccc/connector-react";

export function useWallet() {
  const { open, disconnect, wallet } = ccc.useCcc();
  const signer = ccc.useSigner();

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    if (!signer) {
      setAddress("");
      setBalance("");
      return;
    }

    const fetchWalletData = async () => {
      try {
        const addr = await signer.getRecommendedAddress();
        setAddress(addr);

        const capacity = await signer.getBalance();
        setBalance(ccc.fixedPointToString(capacity));
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      }
    };

    void fetchWalletData();
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
  };
}
