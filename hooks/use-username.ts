"use client";

import { useCallback } from "react";
import { useSigner } from "@ckb-ccc/connector-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const queryKey = ["usernameByOwner", signer ? "connected" : "disconnected"];

  const query = useQuery({
    queryKey,
    enabled: Boolean(signer),
    queryFn: async (): Promise<Username | null> => {
      if (!signer) return null;
      return getUsernameByOwner(signer);
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (raw: string): Promise<Username> => {
      if (!signer) {
        throw new Error("Connect your wallet to claim a username.");
      }
      return claimUsername(signer, raw);
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      requestWalletRefresh();
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!signer) return;
      await releaseUsername(signer);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      requestWalletRefresh();
    },
  });

  const claim = useCallback(
    async (raw: string): Promise<Username> => {
      return claimMutation.mutateAsync(raw);
    },
    [claimMutation],
  );

  const release = useCallback(async () => {
    await releaseMutation.mutateAsync();
  }, [releaseMutation]);

  const checkAvailability = useCallback(
    async (raw: string): Promise<UsernameAvailability> => {
      return checkUsernameAvailability(raw, signer);
    },
    [signer],
  );

  return {
    username: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    isClaiming: claimMutation.isPending || releaseMutation.isPending,
    refresh: query.refetch,
    claim,
    release,
    checkAvailability,
    hasWallet: !!signer,
  };
}
