"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <main className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-8 md:p-10">
            <div className="inline-flex items-center gap-2 border-[3px] border-ink bg-shock text-paper px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical error
            </div>
            <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight mb-3">
              App crashed
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              A fatal rendering error happened. Try resetting this view or go to
              the home page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 bg-ink text-paper border-[3px] border-ink py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                Reset app
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-acid text-ink border-[3px] border-ink py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest font-bold"
              >
                Go home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
