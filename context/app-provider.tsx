"use client";

import { Provider } from "@ckb-ccc/connector-react";
import { createContext, useContext, useMemo } from "react";
import { Toaster } from "sonner";
import { useSpore } from "@/hooks/use-spore";
import { useUsername } from "@/hooks/use-username";
import { useProfile } from "@/hooks/use-profile";
import { getClient } from "@/lib/registry/client";

type SporeStore = ReturnType<typeof useSpore>;
type UsernameStore = ReturnType<typeof useUsername>;
type ProfileStore = ReturnType<typeof useProfile>;

const SporeContext = createContext<SporeStore | null>(null);
const UsernameContext = createContext<UsernameStore | null>(null);
const ProfileContext = createContext<ProfileStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const defaultClient = useMemo(() => getClient(), []);

  return (
    <Provider defaultClient={defaultClient}>
      <AppProviderContent>{children}</AppProviderContent>
    </Provider>
  );
}

function AppProviderContent({ children }: { children: React.ReactNode }) {
  const sporeStore = useSpore();
  const usernameStore = useUsername();
  const profileStore = useProfile();

  return (
    <SporeContext.Provider value={sporeStore}>
      <UsernameContext.Provider value={usernameStore}>
        <ProfileContext.Provider value={profileStore}>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              classNames: {
                toast: "!border-[3px] !border-ink !rounded-none !font-mono",
                title: "!uppercase !tracking-widest !text-[11px]",
                description: "!text-[11px]",
              },
            }}
          />
        </ProfileContext.Provider>
      </UsernameContext.Provider>
    </SporeContext.Provider>
  );
}

export function useSporeContext() {
  const value = useContext(SporeContext);
  if (!value) {
    throw new Error("useSporeContext must be used inside AppProvider");
  }
  return value;
}

export function useUsernameContext() {
  const value = useContext(UsernameContext);
  if (!value) {
    throw new Error("useUsernameContext must be used inside AppProvider");
  }
  return value;
}

export function useProfileContext() {
  const value = useContext(ProfileContext);
  if (!value) {
    throw new Error("useProfileContext must be used inside AppProvider");
  }
  return value;
}
