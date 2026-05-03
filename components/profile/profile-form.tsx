"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Save, Database } from "lucide-react";
import { PROFILE_RULES } from "@/lib/registry/config";
import { profileSizeBreakdown } from "@/lib/registry/capacity";
import type { Profile } from "@/lib/registry/types";

interface ProfileFormProps {
  initial?: Profile;
  submitLabel?: string;
  busy?: boolean;
  onSubmit: (data: Profile) => void | Promise<void>;
}

export function ProfileForm({
  initial,
  submitLabel = "Save Profile",
  busy,
  onSubmit,
}: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [github, setGithub] = useState(initial?.links?.github ?? "");
  const [x, setX] = useState(initial?.links?.x ?? "");
  const [website, setWebsite] = useState(initial?.links?.website ?? "");

  useEffect(() => {
    if (!initial) return;
    setName(initial.name ?? "");
    setHeadline(initial.headline ?? "");
    setBio(initial.bio ?? "");
    setSkills(initial.skills ?? []);
    setGithub(initial.links?.github ?? "");
    setX(initial.links?.x ?? "");
    setWebsite(initial.links?.website ?? "");
  }, [initial]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (skills.length >= PROFILE_RULES.maxSkills) return;
    if (skills.includes(s)) return;
    setSkills([...skills, s]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      links: {
        github: github.trim() || undefined,
        x: x.trim() || undefined,
        website: website.trim() || undefined,
      },
    });
  };

  const canSave = name.trim().length > 0 && !busy;

  const liveProfile: Profile = useMemo(
    () => ({
      name: name.trim() || "_",
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      links: {
        github: github.trim() || undefined,
        x: x.trim() || undefined,
        website: website.trim() || undefined,
      },
    }),
    [name, headline, bio, skills, github, x, website],
  );

  const sizeBreakdown = useMemo(
    () => profileSizeBreakdown(liveProfile),
    [liveProfile],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Display Name" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, PROFILE_RULES.nameMaxLength))}
          placeholder="Chioma Builder"
          className="w-full bg-paper border-[3px] border-ink px-4 py-3 font-display text-lg uppercase focus:outline-none focus:bg-acid transition-colors"
        />
      </Field>

      <Field label="Headline">
        <input
          value={headline}
          onChange={(e) =>
            setHeadline(e.target.value.slice(0, PROFILE_RULES.headlineMaxLength))
          }
          placeholder="CKB builder · Spore protocol"
          className="w-full bg-paper border-[3px] border-ink px-4 py-3 font-mono text-sm uppercase tracking-wide focus:outline-none focus:bg-acid/30 transition-colors"
        />
        <Counter value={headline.length} max={PROFILE_RULES.headlineMaxLength} />
      </Field>

      <Field label="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, PROFILE_RULES.bioMaxLength))}
          rows={4}
          placeholder="Tell other builders what you're working on."
          className="w-full bg-paper border-[3px] border-ink px-4 py-3 font-sans text-sm focus:outline-none focus:bg-acid/30 transition-colors resize-none"
        />
        <Counter value={bio.length} max={PROFILE_RULES.bioMaxLength} />
      </Field>

      <Field label="Skills">
        <div className="flex flex-wrap gap-2 mb-2">
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 bg-acid border-[3px] border-ink px-2 py-1 font-mono text-xs uppercase tracking-widest font-bold"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSkill(s)}
                className="hover:text-shock"
                aria-label={`Remove ${s}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add skill"
            className="flex-1 bg-paper border-[3px] border-ink px-3 py-2 font-mono text-xs uppercase tracking-widest focus:outline-none focus:bg-acid/30 transition-colors"
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={skills.length >= PROFILE_RULES.maxSkills}
            className="bg-ink text-paper border-[3px] border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add
          </button>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          {skills.length}/{PROFILE_RULES.maxSkills} skills
        </p>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field label="GitHub">
          <input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="github.com/you"
            className="w-full bg-paper border-[3px] border-ink px-3 py-2 font-mono text-xs focus:outline-none focus:bg-acid/30 transition-colors"
          />
        </Field>
        <Field label="X / Twitter">
          <input
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="x.com/you"
            className="w-full bg-paper border-[3px] border-ink px-3 py-2 font-mono text-xs focus:outline-none focus:bg-acid/30 transition-colors"
          />
        </Field>
        <Field label="Website">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            className="w-full bg-paper border-[3px] border-ink px-3 py-2 font-mono text-xs focus:outline-none focus:bg-acid/30 transition-colors"
          />
        </Field>
      </div>

      <CellSizeMeter breakdown={sizeBreakdown} />

      <motion.button
        whileHover={canSave ? { x: -2, y: -2 } : undefined}
        whileTap={canSave ? { x: 2, y: 2 } : undefined}
        type="submit"
        disabled={!canSave}
        className="w-full bg-ink text-paper border-[5px] border-ink py-4 font-display text-xl uppercase tracking-tight shadow-brutal-lg flex items-center justify-center gap-3 disabled:opacity-60"
      >
        <Save className="w-5 h-5" />
        {busy ? "Saving..." : submitLabel}
      </motion.button>
    </form>
  );
}

function CellSizeMeter({
  breakdown,
}: {
  breakdown: ReturnType<typeof profileSizeBreakdown>;
}) {
  return (
    <div className="bg-ink text-paper border-[5px] border-ink p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-acid">
          <Database className="w-3.5 h-3.5" />
          On-chain Cost
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-paper/60">
          1 byte = 1 CKB
        </span>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="font-display text-6xl leading-none">
          ~{breakdown.totalCkb}
        </span>
        <span className="font-mono text-sm pb-2">CKB</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] uppercase tracking-wider">
        <Cell label="Profile JSON" value={`${breakdown.dataBytes} B`} />
        <Cell label="Lock script" value={`${breakdown.lockBytes} B`} />
        <Cell label="Type script" value={`${breakdown.typeBytes} B`} />
        <Cell label="Header" value={`${breakdown.capacityFieldBytes} B`} />
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-paper/50 mt-3">
        This much CKB is locked into the cell. You get it all back if you burn
        the profile.
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-paper/30 px-2 py-1.5">
      <div className="text-paper/50">{label}</div>
      <div className="text-acid font-bold">{value}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1.5">
        {label}
        {required && <span className="text-shock ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1 text-right">
      {value}/{max}
    </p>
  );
}
