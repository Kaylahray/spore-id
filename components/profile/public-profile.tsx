"use client";

import { motion } from "framer-motion";
import {
  AtSign,
  Globe,
  Hexagon,
  Calendar,
  Sparkles,
  Code2,
  MessageCircle,
} from "lucide-react";
import type { StoredProfile } from "@/lib/registry/types";
import type { MintedSpore } from "@/hooks/use-spore";

interface PublicProfileProps {
  username: string;
  profile: StoredProfile;
  spores?: MintedSpore[];
}

const ROLE_ACCENTS = ["bg-acid", "bg-shock", "bg-cobalt", "bg-lime"] as const;

export function PublicProfile({ username, profile, spores = [] }: PublicProfileProps) {
  const avatar = spores.find((s) => s.id === profile.avatarSporeId);
  const badges = (profile.badgeSporeIds ?? [])
    .map((id) => spores.find((s) => s.id === id))
    .filter(Boolean) as MintedSpore[];
  const projects = (profile.projectSporeIds ?? [])
    .map((id) => spores.find((s) => s.id === id))
    .filter(Boolean) as MintedSpore[];
  const otherSpores = spores.filter(
    (s) =>
      s.id !== profile.avatarSporeId &&
      !profile.badgeSporeIds?.includes(s.id) &&
      !profile.projectSporeIds?.includes(s.id),
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-paper border-[5px] border-ink shadow-brutal-xl relative overflow-hidden"
      >
        <div className="bg-ink text-acid px-5 py-3 flex items-center justify-between border-b-[5px] border-ink">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold">
            <Hexagon className="w-3.5 h-3.5" />
            Spore/ID Builder Profile
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest">
            v0.1
          </span>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <div className="aspect-square border-[5px] border-ink overflow-hidden bg-paper relative">
            {avatar ? (
              <img
                src={avatar.imageUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full halftone flex items-center justify-center">
                <Sparkles className="w-10 h-10" />
              </div>
            )}
            <div className="absolute -top-3 -right-3 bg-shock text-paper border-[3px] border-ink px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold rotate-3">
              On-chain
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-widest mb-2 inline-flex items-center gap-1 bg-ink text-acid px-2 py-1">
              <AtSign className="w-3.5 h-3.5" />
              {username}
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight mb-2">
              {profile.name}
            </h1>
            {profile.headline && (
              <p className="font-mono text-sm uppercase tracking-wide mb-4">
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p className="font-sans text-sm md:text-base mb-4 max-w-xl">
                {profile.bio}
              </p>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((s, i) => (
                  <span
                    key={s}
                    className={`border-[3px] border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold ${ROLE_ACCENTS[i % ROLE_ACCENTS.length]}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {profile.links && (
              <div className="flex flex-wrap gap-2">
                {profile.links.github && (
                  <LinkChip href={ensureUrl(profile.links.github)} label="GitHub">
                    <Code2 className="w-3.5 h-3.5" />
                  </LinkChip>
                )}
                {profile.links.x && (
                  <LinkChip href={ensureUrl(profile.links.x)} label="X">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </LinkChip>
                )}
                {profile.links.website && (
                  <LinkChip href={ensureUrl(profile.links.website)} label="Site">
                    <Globe className="w-3.5 h-3.5" />
                  </LinkChip>
                )}
              </div>
            )}

            <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {formatDate(profile.createdAt)}
            </div>
          </div>
        </div>
      </motion.div>

      <Section title="Badges" count={badges.length}>
        {badges.length === 0 ? (
          <EmptySection text="No badges yet." />
        ) : (
          <SporeGrid spores={badges} accent="bg-shock text-paper" />
        )}
      </Section>

      <Section title="Projects" count={projects.length}>
        {projects.length === 0 ? (
          <EmptySection text="No projects pinned yet." />
        ) : (
          <SporeGrid spores={projects} accent="bg-cobalt text-paper" />
        )}
      </Section>

      {otherSpores.length > 0 && (
        <Section title="Other Spores" count={otherSpores.length}>
          <SporeGrid spores={otherSpores} accent="bg-acid text-ink" />
        </Section>
      )}
    </div>
  );
}

function LinkChip({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-paper border-[3px] border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-acid transition-colors"
    >
      {children}
      {label}
    </a>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-display text-2xl uppercase">{title}</h2>
        <span className="bg-ink text-acid border-[3px] border-ink px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold">
          {String(count).padStart(2, "0")}
        </span>
        <div className="flex-1 h-0.75 bg-ink" />
      </div>
      {children}
    </section>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <div className="border-[3px] border-dashed border-ink px-4 py-6 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
      {text}
    </div>
  );
}

function SporeGrid({
  spores,
  accent,
}: {
  spores: MintedSpore[];
  accent: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {spores.map((s) => (
        <div
          key={s.id}
          className="bg-paper border-[3px] border-ink shadow-brutal overflow-hidden"
        >
          <div className="aspect-square border-b-[3px] border-ink overflow-hidden">
            <img
              src={s.imageUrl}
              alt={s.name || s.id}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-2">
            <div
              className={`inline-block border-[2px] border-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold mb-1 ${accent}`}
            >
              {s.role || "Spore"}
            </div>
            <div className="font-display text-sm uppercase truncate">
              {s.name || s.id.slice(0, 8)}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-1">
              {s.ckbCapacity} CKB
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ensureUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  return `https://${input}`;
}

function formatDate(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) {
    return "Today";
  }
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}
