"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Wallet, ImagePlus, Coins } from "lucide-react";

interface EmptyStateProps {
  mode?: "no-wallet" | "loading" | "no-spores";
}

const STEPS = [
  {
    icon: Wallet,
    title: "Connect wallet",
    body: "Link your CKB wallet. We never custody keys - your bytes, your rules.",
    accent: "bg-acid text-ink",
  },
  {
    icon: ImagePlus,
    title: "Upload your face",
    body: "Drop an image. It gets serialized and lives on-chain forever. No IPFS pinning roulette.",
    accent: "bg-shock text-paper",
  },
  {
    icon: Coins,
    title: "Lock CKB capacity",
    body: "1 CKB = 1 byte. Pay the storage rent once. Your identity stays put.",
    accent: "bg-cobalt text-paper",
  },
  {
    icon: Sparkles,
    title: "Mint the spore",
    body: "Sign the transaction. Your raw on-chain ID is born. Export, share, flex.",
    accent: "bg-lime text-ink",
  },
];

export function EmptyState({ mode = "no-spores" }: EmptyStateProps) {
  const isNoWallet = mode === "no-wallet";
  const isLoading = mode === "loading";

  const title = isNoWallet
    ? "No wallet."
    : isLoading
      ? "Loading spores."
      : "No spores.";
  const badge = isNoWallet
    ? "WAITING_FOR_WALLET"
    : isLoading
      ? "SYNCING_CHAIN"
      : "NEW_WALLET";
  const body = isNoWallet
    ? "Connect your wallet to view and manage on-chain SporeID cards."
    : isLoading
      ? "Scanning your wallet for image spores on Nervos CKB."
      : "Your gallery is a blank cell. Mint your first SporeID to claim a permanent slot on the Nervos CKB chain.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-3xl uppercase">My ID Cards</h2>
        <div className="bg-paper text-ink border-[3px] border-ink px-3 py-1 font-mono text-xs uppercase tracking-widest font-bold">
          00 minted
        </div>
      </div>

      <div className="relative bg-paper border-[5px] border-ink shadow-brutal-lg overflow-hidden">
        <div className="absolute inset-0 halftone opacity-15 pointer-events-none" />

        <div className="relative bg-ink text-acid px-5 py-3 border-b-[5px] border-ink flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
            Status / {badge}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest">
            00 / 00
          </span>
        </div>

        <div className="relative p-6 md:p-10 text-center">
          <div className="relative mx-auto w-40 h-40 border-[5px] border-dashed border-ink flex items-center justify-center mb-6 bg-paper">
            <div className="absolute inset-2 stripes opacity-10" />
            <ImagePlus
              className="w-12 h-12 text-ink relative"
              strokeWidth={2.5}
            />
            <div className="absolute -top-3 -right-3 bg-shock text-paper border-[3px] border-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold rotate-3">
              Empty
            </div>
          </div>

          <h3 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight mb-3">
            {title}
            <br />
            <span className="bg-acid px-2 inline-block mt-1">Yet.</span>
          </h3>
          <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6">
            {body}
          </p>

          <div className="hidden md:flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest font-bold text-ink">
            <ArrowLeft className="w-4 h-4 animate-pulse" strokeWidth={3} />
            Start at the Minting Station
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-ink text-paper px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
            How it works
          </div>
          <div className="flex-1 h-0.75 bg-ink" />
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative bg-paper border-[3px] border-ink p-4 shadow-brutal flex gap-3"
              >
                <div
                  className={`shrink-0 w-10 h-10 ${step.accent} border-[3px] border-ink flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="font-display text-base uppercase leading-tight mb-1">
                    {step.title}
                  </h4>
                  <p className="font-sans text-xs text-muted-foreground leading-snug">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 w-full bg-paper border-[3px] border-ink px-4 py-3 font-mono text-xs uppercase tracking-widest font-bold shadow-brutal text-center">
          {isNoWallet
            ? "Connect wallet from top nav"
            : isLoading
              ? "Fetching latest spores"
              : "Mint your first spore from the station"}
        </div>
      </div>
    </motion.div>
  );
}
