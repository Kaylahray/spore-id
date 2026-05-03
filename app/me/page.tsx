"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  Sparkles,
  ArrowRight,
  Eye,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useProfileContext,
  useSporeContext,
  useUsernameContext,
} from "@/context/app-provider";
import { useWallet } from "@/hooks/use-wallet";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileLink } from "@/components/profile/profile-link";
import { PublicProfile } from "@/components/profile/public-profile";
import type { Profile } from "@/lib/registry/types";

export default function MePage() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();
  const { username, release, isClaiming } = useUsernameContext();
  const { profile, save, burn, isSaving } = useProfileContext();
  const { mintedSpores } = useSporeContext();
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<"burn" | "release" | null>(null);
  const [pendingAction, setPendingAction] = useState<null | "burn" | "release">(
    null,
  );
  const [statusNote, setStatusNote] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <Shell>
        <EmptyHero
          title="Connect Wallet"
          body="Sign in with your CKB wallet to view your builder dashboard."
          action={
            <button
              onClick={connect}
              type="button"
              className="bg-ink text-paper border-[5px] border-ink py-3 px-5 font-display text-lg uppercase tracking-tight shadow-brutal-lg"
            >
              Connect
            </button>
          }
        />
      </Shell>
    );
  }

  if (!username && !profile) {
    return (
      <Shell>
        <EmptyHero
          title="No builder profile yet"
          body="Claim your handle and create a profile cell to set up your decentralized identity."
          action={
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-shock text-paper border-[5px] border-ink py-3 px-5 font-display text-lg uppercase tracking-tight shadow-brutal-lg"
            >
              Start Onboarding
              <ArrowRight className="w-5 h-5" />
            </Link>
          }
        />
      </Shell>
    );
  }

  if (!username && profile) {
    return (
      <Shell>
        <EmptyHero
          title="Reclaim your handle"
          body="You released your username. Your public page is hidden and there is no share link until you claim a handle again. Your profile cell is still on your wallet — use onboarding to attach it to a new handle and tap Update profile when you get there."
          action={
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-shock text-paper border-[5px] border-ink py-3 px-5 font-display text-lg uppercase tracking-tight shadow-brutal-lg"
            >
              Continue onboarding
              <ArrowRight className="w-5 h-5" />
            </Link>
          }
        />
      </Shell>
    );
  }

  if (username && !profile) {
    return (
      <Shell>
        <EmptyHero
          title="Add your profile"
          body="You have a handle but no profile cell yet. Finish onboarding to publish your public page."
          action={
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-shock text-paper border-[5px] border-ink py-3 px-5 font-display text-lg uppercase tracking-tight shadow-brutal-lg"
            >
              Finish onboarding
              <ArrowRight className="w-5 h-5" />
            </Link>
          }
        />
      </Shell>
    );
  }

  const myUsername = username;
  const myProfile = profile;
  if (myUsername == null || myProfile == null) {
    return null;
  }

  const handleSave = async (data: Profile) => {
    try {
      await save(data, myUsername.username);
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleBurn = async () => {
    setPendingAction("burn");
    setStatusNote("Preparing burn transaction...");
    try {
      await burn();
      toast.success("Profile burned");
      setStatusNote("Profile burned. You can create a new one anytime.");
    } catch (err) {
      setStatusNote(null);
      toast.error("Could not burn", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleReleaseUsername = async () => {
    setPendingAction("release");
    setStatusNote(`Releasing @${myUsername.username} on-chain...`);
    try {
      await release();
      setStatusNote("Handle released. Redirecting to onboarding...");
      toast.success("Username released", {
        description: "Public page hidden. Reclaim a handle on onboarding to go live again.",
      });
      setTimeout(() => router.push("/onboard"), 800);
    } catch (err) {
      setStatusNote(null);
      toast.error("Could not release", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const isBusy = isSaving || isClaiming || pendingAction !== null;
  const isBurning = pendingAction === "burn";
  const isReleasing = pendingAction === "release";

  return (
    <Shell>
      <div className="mb-4">
        <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight">
          My Builder Page
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-1">
          Edit, burn, or share your decentralized identity.
        </p>
      </div>
      {statusNote ? (
        <div className="mb-4 border-[3px] border-ink bg-acid px-3 py-2 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {statusNote}
        </div>
      ) : null}

      <div className="mb-4">
        <ProfileLink username={myUsername.username} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.button
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 2, y: 2 }}
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={isBusy}
          className="bg-paper text-ink border-[3px] border-ink py-3 px-4 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-brutal"
        >
          {editing ? (
            <>
              <Eye className="w-4 h-4" />
              View Profile
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </motion.button>
        <Link
          href="/mint"
          className="bg-acid text-ink border-[3px] border-ink py-3 px-4 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-brutal"
        >
          <Sparkles className="w-4 h-4" />
          Mint profile picture
        </Link>
      </div>
      <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        After minting, edit profile, pick the avatar spore, then save to publish
        it on your shareable page.
      </p>

      {editing ? (
        <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-6 md:p-8">
          <h2 className="font-display text-2xl uppercase mb-4">Edit Profile</h2>
          <ProfileForm
            initial={myProfile}
            submitLabel="Save Changes"
            busy={isSaving}
            spores={mintedSpores}
            onSubmit={handleSave}
          />
        </div>
      ) : (
        <PublicProfile
          username={myUsername.username}
          profile={myProfile}
          spores={mintedSpores}
        />
      )}

      <div className="mt-10 border-t-[3px] border-ink pt-6">
        <h3 className="font-mono text-xs uppercase tracking-widest font-bold mb-3 text-shock">
          Danger Zone
        </h3>
        {(isBurning || isReleasing) && (
          <div className="mb-3 inline-flex items-center gap-2 border-[3px] border-ink bg-acid px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {isBurning
              ? "Burning profile cell on-chain..."
              : `Releasing @${myUsername.username} on-chain...`}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setModal("burn")}
            type="button"
            disabled={isBusy}
            className="bg-paper text-ink border-[3px] border-ink py-2 px-3 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 hover:bg-shock hover:text-paper transition-colors disabled:opacity-60"
          >
            {isBurning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isBurning ? "Burning profile..." : "Burn profile cell"}
          </button>
          <button
            onClick={() => setModal("release")}
            type="button"
            disabled={isBusy}
            className="bg-paper text-ink border-[3px] border-ink py-2 px-3 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 hover:bg-shock hover:text-paper transition-colors disabled:opacity-60"
          >
            {isReleasing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isReleasing
              ? `Releasing @${myUsername.username}...`
              : `Release @${myUsername.username}`}
          </button>
        </div>
      </div>
      <ConfirmModal
        open={modal === "burn"}
        title="Burn profile cell?"
        body="This removes your current profile cell from chain. Your username stays and you can create a new profile later."
        confirmText={pendingAction === "burn" ? "Burning..." : "Burn profile"}
        busy={pendingAction === "burn"}
        onClose={() => setModal(null)}
        onConfirm={async () => {
          setModal(null);
          await handleBurn();
        }}
      />
      <ConfirmModal
        open={modal === "release"}
        title={`Release @${myUsername.username}?`}
        body={`Your /u/${myUsername.username} page will be hidden, and the handle becomes claimable by others. Your profile cell stays in your wallet and can be linked again after onboarding.`}
        confirmText={pendingAction === "release" ? "Releasing..." : "Release handle"}
        busy={pendingAction === "release"}
        onClose={() => setModal(null)}
        onConfirm={async () => {
          setModal(null);
          await handleReleaseUsername();
        }}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

function EmptyHero({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-8 md:p-12 text-center">
      <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight mb-3">
        {title}
      </h1>
      <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6">
        {body}
      </p>
      <div className="inline-block">{action}</div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  body,
  confirmText,
  busy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmText: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper border-[5px] border-ink shadow-brutal-xl p-4 sm:p-6 relative">
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
          Confirm action
        </div>
        <h4 className="font-display text-3xl uppercase leading-[0.9] tracking-tight mb-2">
          {title}
        </h4>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground leading-relaxed mb-5">
          {body}
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
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
