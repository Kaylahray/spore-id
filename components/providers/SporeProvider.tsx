"use client";

import { createContext, useContext } from "react";
import { useSpore } from "@/hooks/use-spore";

type SporeStore = ReturnType<typeof useSpore>;

const SporeContext = createContext<SporeStore | null>(null);

export function SporeProvider({ children }: { children: React.ReactNode }) {
  const store = useSpore();

  return (
    <SporeContext.Provider value={store}>{children}</SporeContext.Provider>
  );
}

export function useSporeContext() {
  const value = useContext(SporeContext);
  if (!value) {
    throw new Error("useSporeContext must be used inside SporeProvider");
  }

  return value;
}
