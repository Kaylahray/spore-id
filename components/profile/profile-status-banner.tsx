"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, AtSign } from "lucide-react";
import { useUsernameContext, useProfileContext } from "@/context/app-provider";
import { useWallet } from "@/hooks/use-wallet";

export function ProfileStatusBanner() {
  const { isConnected } = useWallet();
  const { username } = useUsernameContext();
  const { profile } = useProfileContext();

  if (!isConnected) return null;
  if (!username && profile) {
    return (
      <div className="border-[5px] border-ink bg-acid mb-6 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-brutal">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
          <AtSign className="w-4 h-4" />
          <span className="font-bold">Handle released</span>
          <span className="hidden md:inline text-ink/70">
            Public page hidden — reclaim a handle to restore your link. Profile
            data is still on your wallet.
          </span>
        </div>
        <Link
          href="/onboard"
          className="inline-flex items-center gap-2 bg-ink text-paper px-3 py-1.5 border-[3px] border-ink font-mono text-[10px] uppercase tracking-widest font-bold"
        >
          Reclaim handle
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }
  if (username && profile) {
    return (
      <div className="border-[5px] border-ink bg-lime mb-6 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-brutal">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
          <AtSign className="w-4 h-4" />
          <span className="font-bold">{username.username}</span>
          <span className="text-ink/60">·</span>
          <span>{profile.name}</span>
        </div>
        <Link
          href="/me"
          className="inline-flex items-center gap-2 bg-ink text-paper px-3 py-1.5 border-[3px] border-ink font-mono text-[10px] uppercase tracking-widest font-bold"
        >
          My Builder Page
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="border-[5px] border-ink bg-acid mb-6 px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-brutal">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
        <Sparkles className="w-4 h-4" />
        <span className="font-bold">No builder profile yet.</span>
        <span className="hidden md:inline">
          Claim your handle and create a profile to build your identity.
        </span>
      </div>
      <Link href="/onboard">
        <motion.span
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 2, y: 2 }}
          className="inline-flex items-center gap-2 bg-ink text-paper px-3 py-1.5 border-[3px] border-ink font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer"
        >
          Start Onboarding
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.span>
      </Link>
    </div>
  );
}
