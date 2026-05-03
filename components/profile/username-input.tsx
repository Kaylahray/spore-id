"use client";

import { useEffect, useRef, useState } from "react";
import { Check, AlertCircle, Loader2, AtSign } from "lucide-react";
import { useUsernameContext } from "@/context/app-provider";
import { USERNAME_RULES } from "@/lib/registry/config";
import { isValidUsername, normalizeUsername } from "@/lib/registry/encoding";

type Status =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "format" }
  | { kind: "taken" }
  | { kind: "owned" };

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (valid: boolean) => void;
  autoFocus?: boolean;
}

export function UsernameInput({
  value,
  onChange,
  onValidityChange,
  autoFocus,
}: UsernameInputProps) {
  const { checkAvailability, username, hasWallet } = useUsernameContext();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const tokenRef = useRef(0);

  const normalized = normalizeUsername(value);
  const formatOk = isValidUsername(normalized);
  const isOwnedByMe = !!username && username.username === normalized;

  useEffect(() => {
    onValidityChange?.(formatOk && (status.kind === "available" || status.kind === "owned"));
  }, [formatOk, status.kind, onValidityChange]);

  useEffect(() => {
    if (!normalized) {
      setStatus({ kind: "idle" });
      return;
    }
    if (!formatOk) {
      setStatus({ kind: "format" });
      return;
    }
    if (isOwnedByMe) {
      setStatus({ kind: "owned" });
      return;
    }

    setStatus({ kind: "checking" });
    const token = ++tokenRef.current;
    const timer = setTimeout(async () => {
      const result = await checkAvailability(normalized);
      if (token !== tokenRef.current) return;
      if (result.ok) {
        setStatus({ kind: "available" });
      } else if (result.reason === "taken") {
        setStatus({ kind: "taken" });
      } else {
        setStatus({ kind: "format" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [normalized, formatOk, isOwnedByMe, checkAvailability]);

  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1.5">
        Username
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-display text-xl">
          <AtSign className="w-5 h-5" />
        </span>
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="alice_dev"
          className="w-full bg-paper border-[3px] border-ink pl-10 pr-12 py-3 font-display text-lg uppercase focus:outline-none focus:bg-acid transition-colors tracking-wide"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <StatusIcon status={status} />
        </span>
      </div>

      <StatusMessage
        status={status}
        hasWallet={hasWallet}
        normalized={normalized}
      />
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {USERNAME_RULES.hint}
      </p>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  switch (status.kind) {
    case "checking":
      return <Loader2 className="w-5 h-5 animate-spin" />;
    case "available":
    case "owned":
      return <Check className="w-5 h-5 text-ink bg-lime border-2 border-ink p-0.5" />;
    case "taken":
    case "format":
      return <AlertCircle className="w-5 h-5 text-paper bg-shock border-2 border-ink p-0.5" />;
    default:
      return null;
  }
}

function StatusMessage({
  status,
  hasWallet,
  normalized,
}: {
  status: Status;
  hasWallet: boolean;
  normalized: string;
}) {
  if (!normalized) return null;

  let label = "";
  let bg = "bg-paper";
  let fg = "text-ink";

  switch (status.kind) {
    case "checking":
      label = "Checking...";
      break;
    case "available":
      label = hasWallet ? "Available" : "Available — connect wallet to claim";
      bg = "bg-lime";
      break;
    case "owned":
      label = "You already own this handle";
      bg = "bg-acid";
      break;
    case "taken":
      label = "Already taken";
      bg = "bg-shock";
      fg = "text-paper";
      break;
    case "format":
      label = "Invalid format";
      bg = "bg-shock";
      fg = "text-paper";
      break;
    default:
      return null;
  }

  return (
    <div
      className={`mt-2 inline-block border-[3px] border-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold ${bg} ${fg}`}
    >
      {label}
    </div>
  );
}
