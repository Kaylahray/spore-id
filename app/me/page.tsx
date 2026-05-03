"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Trash2, Sparkles, ArrowRight, Eye } from "lucide-react";
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
  const { username, release } = useUsernameContext();
  const { profile, save, burn, isSaving } = useProfileContext();
  const { mintedSpores } = useSporeContext();
  const [editing, setEditing] = useState(false);

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
    if (
      !confirm(
        "Burn your profile cell? Your username stays. You can create a new profile later.",
      )
    ) {
      return;
    }
    try {
      await burn();
      toast.success("Profile burned");
    } catch (err) {
      toast.error("Could not burn", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleReleaseUsername = async () => {
    if (
      !confirm(
        `Release @${myUsername.username}?\n\n` +
          `• Your public /u/${myUsername.username} page will disappear until you claim a handle again.\n` +
          `• The share link stays hidden from this page until then.\n` +
          `• Your profile cell stays on your wallet — after you reclaim, onboarding will open your existing data and you can tap Update profile.\n` +
          `• The handle becomes available for anyone else to claim.`,
      )
    ) {
      return;
    }
    try {
      await release();
      toast.success("Username released", {
        description: "Public page hidden. Reclaim a handle on onboarding to go live again.",
      });
      router.push("/onboard");
    } catch (err) {
      toast.error("Could not release", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

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

      <div className="mb-4">
        <ProfileLink username={myUsername.username} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.button
          whileHover={{ x: -2, y: -2 }}
          whileTap={{ x: 2, y: 2 }}
          type="button"
          onClick={() => setEditing((v) => !v)}
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
          Mint a Spore
        </Link>
      </div>

      {editing ? (
        <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-6 md:p-8">
          <h2 className="font-display text-2xl uppercase mb-4">Edit Profile</h2>
          <ProfileForm
            initial={myProfile}
            submitLabel="Save Changes"
            busy={isSaving}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={handleBurn}
            type="button"
            className="bg-paper text-ink border-[3px] border-ink py-2 px-3 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 hover:bg-shock hover:text-paper transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Burn profile cell
          </button>
          <button
            onClick={handleReleaseUsername}
            type="button"
            className="bg-paper text-ink border-[3px] border-ink py-2 px-3 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center justify-center gap-2 hover:bg-shock hover:text-paper transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Release @{myUsername.username}
          </button>
        </div>
      </div>
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
