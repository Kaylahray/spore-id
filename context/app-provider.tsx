"use client";

import { Provider } from "@ckb-ccc/connector-react";
import { createContext, useContext } from "react";
import { Toaster } from "sonner";
import { useSpore } from "@/hooks/use-spore";

type SporeStore = ReturnType<typeof useSpore>;

const SporeContext = createContext<SporeStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <AppProviderContent>{children}</AppProviderContent>
    </Provider>
  );
}

function AppProviderContent({ children }: { children: React.ReactNode }) {
  const store = useSpore();

  return (
    <SporeContext.Provider value={store}>
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