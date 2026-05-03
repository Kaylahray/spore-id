"use client";

import { useCallback, useEffect, useState } from "react";
import { useSigner } from "@ckb-ccc/connector-react";
import {
  checkUsernameAvailability,
  claimUsername,
  getUsernameByOwner,
  releaseUsername,
} from "@/lib/registry/username";
import type { Username, UsernameAvailability } from "@/lib/registry/types";
import { requestWalletRefresh } from "@/lib/wallet-refresh";

export function useUsername() {
  const signer = useSigner();
  const [username, setUsername] = useState<Username | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const refresh = useCallback(async () => {
    if (!signer) {
      setUsername(null);
      return;
    }
    setIsLoading(true);
    try {
      const next = await getUsernameByOwner(signer);
      setUsername(next);
    } catch (error) {
      console.error("Failed to load username:", error);
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const claim = useCallback(
    async (raw: string): Promise<Username> => {
      if (!signer) {
        throw new Error("Connect your wallet to claim a username.");
      }
      setIsClaiming(true);
      try {
        const next = await claimUsername(signer, raw);
        setUsername(next);
        requestWalletRefresh();
        return next;
      } finally {
        setIsClaiming(false);
      }
    },
    [signer],
  );

  const release = useCallback(async () => {
    if (!signer) return;
    setIsClaiming(true);
    try {
      await releaseUsername(signer);
      setUsername(null);
      requestWalletRefresh();
    } finally {
      setIsClaiming(false);
    }
  }, [signer]);

  const checkAvailability = useCallback(
    async (raw: string): Promise<UsernameAvailability> => {
      return checkUsernameAvailability(raw, signer);
    },
    [signer],
  );

  return {
    username,
    isLoading,
    isClaiming,
    refresh,
    claim,
    release,
    checkAvailability,
    hasWallet: !!signer,
  };
}
