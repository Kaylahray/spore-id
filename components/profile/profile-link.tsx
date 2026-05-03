"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface ProfileLinkProps {
  username: string;
  baseUrl?: string;
}

export function ProfileLink({ username, baseUrl }: ProfileLinkProps) {
  const [copied, setCopied] = useState(false);

  const path = `/u/${username}`;
  const fullUrl =
    baseUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : path);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Copied", { description: fullUrl });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="bg-paper border-[3px] border-ink p-3 flex items-center gap-2 font-mono text-xs">
      <span className="text-muted-foreground uppercase tracking-widest text-[10px]">
        Share:
      </span>
      <span className="flex-1 truncate font-bold">{fullUrl}</span>
      <button
        onClick={copy}
        type="button"
        className="bg-acid border-[3px] border-ink px-2 py-1 hover:bg-shock hover:text-paper transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-ink text-acid border-[3px] border-ink px-2 py-1 hover:bg-shock transition-colors"
        aria-label="Open profile"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
