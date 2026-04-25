"use client";

import { Provider } from "@ckb-ccc/connector-react";

export function CccProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
