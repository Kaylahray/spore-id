import Link from "next/link";
import { ProfileStatusBanner } from "@/components/profile/profile-status-banner";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="border-b-[5px] border-ink bg-acid relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20" />
        <div className="max-w-350 mx-auto px-6 py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest mb-3 inline-block bg-ink text-acid px-2 py-1">
                SporeID / CKB testnet
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight max-w-3xl">
                Your handle.{" "}
                <span className="bg-shock text-paper px-2">Your profile.</span>{" "}
                On-chain.
              </h1>
            </div>
            <div className="md:max-w-sm font-mono text-sm leading-relaxed border-l-[5px] border-ink pl-4">
              Claim a username in the registry, publish a profile cell locked to
              your wallet, then mint Spores when you are ready — no account
              server, no opaque metadata hosts.
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-3 border-[3px] border-ink font-mono text-xs uppercase tracking-widest font-bold shadow-brutal hover:bg-shock transition-colors"
            >
              Start onboarding
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/me"
              className="inline-flex items-center gap-2 bg-paper text-ink px-5 py-3 border-[3px] border-ink font-mono text-xs uppercase tracking-widest font-bold shadow-brutal hover:bg-acid transition-colors"
            >
              Builder page
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-350 mx-auto px-6 py-10">
        <ProfileStatusBanner />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-paper border-[5px] border-ink shadow-brutal p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-shock font-bold mb-2">
              01 — Connect
            </div>
            <h2 className="font-display text-xl uppercase tracking-tight mb-2">
              Wallet is the account
            </h2>
            <p className="font-mono text-xs leading-relaxed text-ink/80">
              Connect a CKB wallet. Your keys anchor every profile update and
              Spore you mint.
            </p>
          </div>
          <div className="bg-paper border-[5px] border-ink shadow-brutal p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-shock font-bold mb-2">
              02 — Claim
            </div>
            <h2 className="font-display text-xl uppercase tracking-tight mb-2">
              Reserve your @handle
            </h2>
            <p className="font-mono text-xs leading-relaxed text-ink/80">
              Register a unique name on-chain and attach a profile cell — your
              public page lives at{" "}
              <span className="font-bold text-ink">/u/yourname</span>.
            </p>
          </div>
          <div className="bg-paper border-[5px] border-ink shadow-brutal p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-shock font-bold mb-2">
              03 — Create
            </div>
            <h2 className="font-display text-xl uppercase tracking-tight mb-2">
              Mint Spores after setup
            </h2>
            <p className="font-mono text-xs leading-relaxed text-ink/80">
              When your profile is live, open your builder page or the Mint link
              in the nav to stamp identity NFTs —{" "}
              <strong className="text-ink">1 CKB = 1 byte</strong> of capacity,
              owned outright.
            </p>
          </div>
        </div>

        <div className="border-[5px] border-ink bg-paper shadow-brutal-xl p-6 md:p-8">
          <h2 className="font-display text-2xl uppercase mb-3 tracking-tight">
            Why SporeID
          </h2>
          <p className="font-mono text-sm leading-relaxed text-ink/90 max-w-3xl">
            SporeID bundles a username registry and profile script with the Spore
            protocol: state you can read on-chain, upgrades you control, and a
            clear path from first connection to public identity — minting is a
            later step, not the front door.
          </p>
        </div>
      </main>

      <footer className="border-t-[5px] border-ink bg-ink text-paper mt-auto">
        <div className="max-w-350 mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="font-display text-2xl uppercase">
            Spore<span className="text-shock">/</span>ID
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-paper/60">
            Copyright 2026 — Built on Nervos CKB · No cookies · No tracking ·
            Just bytes
          </div>
        </div>
      </footer>
    </div>
  );
}
