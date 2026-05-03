"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  AtSign,
  UserCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import {
  useUsernameContext,
  useProfileContext,
} from "@/context/app-provider";
import { UsernameInput } from "./username-input";
import { ProfileForm } from "./profile-form";
import type { Profile } from "@/lib/registry/types";

const STEPS = [
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "username", label: "Username", icon: AtSign },
  { id: "profile", label: "Profile", icon: UserCircle2 },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export function OnboardingWizard() {
  const router = useRouter();
  const { isConnected, connect } = useWallet();
  const {
    username,
    claim,
    isClaiming,
  } = useUsernameContext();
  const { profile, create, save, isSaving } = useProfileContext();

  const initialStep: StepId = !isConnected
    ? "wallet"
    : !username
      ? "username"
      : "profile";

  const [step, setStep] = useState<StepId>(initialStep);
  const [pendingUsername, setPendingUsername] = useState(
    username?.username ?? "",
  );
  const [usernameValid, setUsernameValid] = useState(false);

  const advanceFromWallet = async () => {
    if (!isConnected) {
      await Promise.resolve(connect());
      return;
    }
    setStep("username");
  };

  const advanceFromUsername = async () => {
    if (username && username.username === pendingUsername.trim().toLowerCase()) {
      setStep("profile");
      return;
    }
    try {
      await claim(pendingUsername);
      toast.success("Username claimed", {
        description: `@${pendingUsername.toLowerCase()} is yours.`,
      });
      setStep("profile");
    } catch (err) {
      toast.error("Could not claim", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const finishProfile = async (data: Profile) => {
    const handle = username?.username ?? pendingUsername.toLowerCase();
    try {
      if (profile) {
        await save(data, handle);
        toast.success("Profile updated", {
          description: "Your public page is live again under your handle.",
        });
      } else {
        await create(data, handle);
        toast.success("Profile live", {
          description:
            "Your public page is ready. Mint unlocks from the nav next.",
        });
      }
      router.push("/me");
    } catch (err) {
      toast.error("Could not save profile", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Stepper current={step} />
      </div>

      <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-6 md:p-8 relative">
        <div className="absolute -top-4 -left-4 bg-shock text-paper border-[3px] border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold -rotate-3 shadow-brutal">
          Identity setup
        </div>

        {step === "wallet" && (
          <StepWrapper
            title="Connect your wallet"
            description="Your address owns everything you create here — handle, profile, and (later) Spores. Nothing works without this key."
          >
            <motion.button
              whileHover={{ x: -2, y: -2 }}
              whileTap={{ x: 2, y: 2 }}
              type="button"
              onClick={advanceFromWallet}
              className="bg-ink text-paper border-[5px] border-ink py-4 px-6 font-display text-xl uppercase tracking-tight shadow-brutal-lg flex items-center gap-3"
            >
              <Wallet className="w-5 h-5" />
              {isConnected ? "Continue" : "Connect Wallet"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </StepWrapper>
        )}

        {step === "username" && (
          <StepWrapper
            title="Choose your handle"
            description="This is your public name on-chain. It becomes your shareable link: /u/your-handle — first come, first served."
          >
            <UsernameInput
              autoFocus
              value={pendingUsername}
              onChange={setPendingUsername}
              onValidityChange={setUsernameValid}
            />
            <div className="flex gap-3 mt-2">
              <NavButton onClick={() => setStep("wallet")} direction="back">
                Back
              </NavButton>
              <motion.button
                whileHover={usernameValid ? { x: -2, y: -2 } : undefined}
                whileTap={usernameValid ? { x: 2, y: 2 } : undefined}
                type="button"
                onClick={advanceFromUsername}
                disabled={!usernameValid || isClaiming}
                className="flex-1 bg-shock text-paper border-[5px] border-ink py-3 font-display text-lg uppercase tracking-tight shadow-brutal flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isClaiming ? "Claiming..." : "Claim & Continue"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </StepWrapper>
        )}

        {step === "profile" && (
          <StepWrapper
            title="Publish your profile"
            description={
              profile
                ? "Your profile cell is still on chain from before. Review or edit, then update — this re-links it to your handle and restores your public page."
                : "What you enter is stored in your profile cell — visible on your public page. You can edit it anytime from My Page."
            }
          >
            <ProfileForm
              initial={profile ?? undefined}
              submitLabel={profile ? "Update profile" : "Create profile"}
              busy={isSaving}
              onSubmit={finishProfile}
            />
            {isSaving ? (
              <div className="mt-3 inline-flex items-center gap-2 border-[3px] border-ink bg-acid px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Writing profile cell on-chain...
              </div>
            ) : null}
            <NavButton onClick={() => setStep("username")} direction="back">
              Back
            </NavButton>
          </StepWrapper>
        )}
      </div>
    </div>
  );
}

function StepWrapper({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-3xl md:text-4xl uppercase leading-[0.9] tracking-tight mb-2">
          {title}
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function Stepper({ current }: { current: StepId }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 border-[3px] border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold ${
                isCurrent
                  ? "bg-shock text-paper"
                  : isDone
                    ? "bg-lime"
                    : "bg-paper"
              }`}
            >
              {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="w-4 h-0.5 bg-ink" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function NavButton({
  onClick,
  direction,
  children,
}: {
  onClick: () => void;
  direction: "back" | "forward";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="bg-paper border-[3px] border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest font-bold inline-flex items-center gap-1 hover:bg-acid transition-colors"
    >
      {direction === "back" && <ArrowLeft className="w-3 h-3" />}
      {children}
      {direction === "forward" && <ArrowRight className="w-3 h-3" />}
    </button>
  );
}
