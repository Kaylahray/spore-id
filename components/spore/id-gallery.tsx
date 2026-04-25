"use client";

import { Wallet2, RefreshCw } from "lucide-react";
import { SporeCard } from "./spore-card";
import { CellVisualization } from "./cell-visualization";
import { EmptyState } from "./empty-state";
import { useSporeContext } from "@/context/app-provider";
import { useWallet } from "@/hooks/use-wallet";

const ACCENTS = ["shock", "cobalt", "acid", "lime"] as const;

export function IdGallery() {
  const { signer, connect } = useWallet();
  const { mintedSpores, isLoadingSpores, loadMintedSpores } = useSporeContext();

  if (!signer) {
    return (
      <div className="flex flex-col">
        <EmptyState mode="no-wallet" />
      </div>
    );
  }

  if (mintedSpores.length === 0) {
    return (
      <div className="flex flex-col">
        <EmptyState mode={isLoadingSpores ? "loading" : "no-spores"} />
      </div>
    );
  }

  const [main, ...rest] = mintedSpores;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-3xl uppercase">My ID Cards</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadMintedSpores()}
            className="bg-paper text-ink border-[3px] border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-shock hover:text-paper transition-colors"
            type="button"
            disabled={isLoadingSpores}
          >
            <span className="inline-flex items-center gap-1">
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingSpores ? "animate-spin" : ""}`}
              />
              {isLoadingSpores ? "Loading..." : "Refresh"}
            </span>
          </button>
          <div className="bg-ink text-acid border-[3px] border-ink px-3 py-1 font-mono text-xs uppercase tracking-widest font-bold">
            {String(mintedSpores.length).padStart(2, "0")} minted
          </div>
        </div>
      </div>

      <SporeCard
        id={main.id}
        name={main.name || `Spore ${main.id.slice(0, 8)}`}
        role={main.role || main.contentType.replace("image/", "").toUpperCase()}
        bio={main.bio || undefined}
        avatar={main.imageUrl}
        capacity={main.ckbCapacity}
        accent={ACCENTS[0]}
        isMain
      />

      <CellVisualization />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
        {rest.map((spore, index) => (
          <SporeCard
            key={spore.id}
            id={spore.id}
            name={spore.name || `Spore ${spore.id.slice(0, 8)}`}
            role={
              spore.role ||
              spore.contentType.replace("image/", "").toUpperCase()
            }
            bio={spore.bio || undefined}
            avatar={spore.imageUrl}
            capacity={spore.ckbCapacity}
            accent={ACCENTS[(index + 1) % ACCENTS.length]}
          />
        ))}
      </div>
    </div>
  );
}
