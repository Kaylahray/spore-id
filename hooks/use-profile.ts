"use client";

import { useCallback } from "react";
import { useSigner } from "@ckb-ccc/connector-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  burnProfile,
  createProfile,
  getProfileByOwner,
  updateProfile,
} from "@/lib/registry/profile";
import type { Profile, StoredProfile } from "@/lib/registry/types";
import { requestWalletRefresh } from "@/lib/wallet-refresh";

export function useProfile() {
  const signer = useSigner();
  const queryClient = useQueryClient();
  const queryKey = ["profileByOwner", signer ? "connected" : "disconnected"];

  const query = useQuery({
    queryKey,
    enabled: Boolean(signer),
    queryFn: async (): Promise<StoredProfile | null> => {
      if (!signer) return null;
      return getProfileByOwner(signer);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (params: { data: Profile; username?: string }) => {
      if (!signer) {
        throw new Error("Connect your wallet to create a profile.");
      }
      return createProfile(signer, params.data, params.username);
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      requestWalletRefresh();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (params: { data: Profile; username?: string }) => {
      if (!signer) {
        throw new Error("Connect your wallet to update your profile.");
      }
      return updateProfile(signer, params.data, params.username);
    },
    onSuccess: (next) => {
      queryClient.setQueryData(queryKey, next);
      requestWalletRefresh();
    },
  });

  const burnMutation = useMutation({
    mutationFn: async () => {
      if (!signer) return;
      await burnProfile(signer);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, null);
      requestWalletRefresh();
    },
  });

  const create = useCallback(
    async (data: Profile, username?: string) => {
      return createMutation.mutateAsync({ data, username });
    },
    [createMutation],
  );

  const save = useCallback(
    async (data: Profile, username?: string) => {
      return saveMutation.mutateAsync({ data, username });
    },
    [saveMutation],
  );

  const burn = useCallback(async () => {
    await burnMutation.mutateAsync();
  }, [burnMutation]);

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    isSaving:
      createMutation.isPending ||
      saveMutation.isPending ||
      burnMutation.isPending,
    refresh: query.refetch,
    create,
    save,
    burn,
    hasWallet: !!signer,
  };
}
