"use client";

import { useState } from "react";
import { Wallet2, RefreshCw, AlertTriangle, Loader2, X } from "lucide-react";
import { SporeCard } from "./spore-card";
import { CellVisualization } from "./cell-visualization";
import { EmptyState } from "./empty-state";
import { useSporeContext } from "@/context/app-provider";
import { useProfileContext } from "@/context/app-provider";
import { useWallet } from "@/hooks/use-wallet";
import type { MintedSpore } from "@/hooks/use-spore";

const ACCENTS = ["shock", "cobalt", "acid", "lime"] as const;

export function IdGallery() {
  const { signer, connect } = useWallet();
  const {
    mintedSpores,
    isLoadingSpores,
    loadMintedSpores,
    deleteImage,
    deletingSporeId,
  } = useSporeContext();
  const { profile } = useProfileContext();
  const [targetDelete, setTargetDelete] = useState<MintedSpore | null>(null);
  const selectedAvatarId = profile?.avatarSporeId ?? null;

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
        onDelete={() => setTargetDelete(main)}
        isDeleting={deletingSporeId === main.id}
        deleteDisabled={selectedAvatarId === main.id}
        deleteDisabledReason={
          selectedAvatarId === main.id
            ? "This image is currently selected as your profile avatar."
            : undefined
        }
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
            onDelete={() => setTargetDelete(spore)}
            isDeleting={deletingSporeId === spore.id}
            deleteDisabled={selectedAvatarId === spore.id}
            deleteDisabledReason={
              selectedAvatarId === spore.id
                ? "This image is currently selected as your profile avatar."
                : undefined
            }
          />
        ))}
      </div>
      <DeleteImageModal
        open={targetDelete != null}
        target={targetDelete}
        busy={targetDelete ? deletingSporeId === targetDelete.id : false}
        onClose={() => setTargetDelete(null)}
        onConfirm={async () => {
          if (!targetDelete) return;
          await deleteImage(targetDelete.id);
          setTargetDelete(null);
        }}
      />
    </div>
  );
}

function DeleteImageModal({
  open,
  target,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  target: MintedSpore | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!open || !target) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-paper border-[5px] border-ink shadow-brutal-xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="absolute top-3 right-3 border-[3px] border-ink p-1 bg-paper"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="inline-flex items-center gap-2 border-[3px] border-ink bg-acid px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          Confirm delete
        </div>
        <h4 className="font-display text-3xl uppercase leading-[0.9] tracking-tight mb-2">
          Delete image?
        </h4>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground leading-relaxed mb-5">
          This melts the spore on-chain and unlocks its CKB capacity back to
          your wallet.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 bg-paper border-[3px] border-ink py-2.5 font-mono text-[10px] uppercase tracking-widest font-bold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={busy}
            className="flex-1 bg-shock text-paper border-[3px] border-ink py-2.5 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {busy ? "Deleting image..." : "Delete image"}
          </button>
        </div>
      </div>
    </div>
  );
}
