"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowRight } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-8 md:p-10">
          <div className="inline-flex items-center gap-2 border-[3px] border-ink bg-shock text-paper px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            Something broke
          </div>

          <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight mb-3">
            Unexpected app error
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground max-w-3xl">
            A client-side error interrupted this page. You can retry, go back to
            onboarding, or return home.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 bg-ink text-paper border-[3px] border-ink py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-acid text-ink border-[3px] border-ink py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest font-bold"
            >
              Onboarding
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-paper text-ink border-[3px] border-ink py-2.5 px-4 font-mono text-[10px] uppercase tracking-widest font-bold"
            >
              Home
            </Link>
          </div>

          {error?.message ? (
            <p className="mt-6 border-[3px] border-ink bg-paper px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground break-words">
              {error.message}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
