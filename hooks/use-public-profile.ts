"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfileByUsername } from "@/lib/registry/profile";
import { getUsernameByName } from "@/lib/registry/username";
import type { StoredProfile, Username } from "@/lib/registry/types";

export function usePublicProfile(username: string | undefined) {
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [usernameRecord, setUsernameRecord] = useState<Username | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!username) {
      setProfile(null);
      setUsernameRecord(null);
      return;
    }
    setIsLoading(true);
    try {
      const [u, p] = await Promise.all([
        getUsernameByName(username),
        getProfileByUsername(username),
      ]);
      setUsernameRecord(u);
      setProfile(p);
    } catch (error) {
      console.error("Failed to load public profile:", error);
      setUsernameRecord(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, usernameRecord, isLoading, refresh };
}
