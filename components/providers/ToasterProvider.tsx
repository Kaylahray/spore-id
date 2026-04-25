"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
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
  );
}
