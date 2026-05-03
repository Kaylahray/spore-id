"use client";

import { useCallback, useEffect, useState } from "react";
import { useSigner } from "@ckb-ccc/connector-react";
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
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!signer) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    try {
      const next = await getProfileByOwner(signer);
      setProfile(next);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: Profile, username?: string) => {
      if (!signer) {
        throw new Error("Connect your wallet to create a profile.");
      }
      setIsSaving(true);
      try {
        const next = await createProfile(signer, data, username);
        setProfile(next);
        requestWalletRefresh();
        return next;
      } finally {
        setIsSaving(false);
      }
    },
    [signer],
  );

  const save = useCallback(
    async (data: Profile, username?: string) => {
      if (!signer) {
        throw new Error("Connect your wallet to update your profile.");
      }
      setIsSaving(true);
      try {
        const next = await updateProfile(signer, data, username);
        setProfile(next);
        requestWalletRefresh();
        return next;
      } finally {
        setIsSaving(false);
      }
    },
    [signer],
  );

  const burn = useCallback(async () => {
    if (!signer) return;
    setIsSaving(true);
    try {
      await burnProfile(signer);
      setProfile(null);
      requestWalletRefresh();
    } finally {
      setIsSaving(false);
    }
  }, [signer]);

  return {
    profile,
    isLoading,
    isSaving,
    refresh,
    create,
    save,
    burn,
    hasWallet: !!signer,
  };
}
