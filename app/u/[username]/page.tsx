"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, AtSign } from "lucide-react";
import { usePublicProfile } from "@/hooks/use-public-profile";
import { useSporeContext } from "@/context/app-provider";
import { PublicProfile } from "@/components/profile/public-profile";
import { ProfileLink } from "@/components/profile/profile-link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function PublicProfilePage({ params }: PageProps) {
  const { username } = use(params);
  const { profile, avatarSpore, isLoading } = usePublicProfile(username);
  const { mintedSpores } = useSporeContext();
  const sporesForPublicProfile =
    avatarSpore != null
      ? [
          avatarSpore,
          ...mintedSpores.filter((s) => s.id !== avatarSpore.id),
        ]
      : mintedSpores;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="border-b-[5px] border-ink bg-ink text-paper">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold hover:text-acid"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Spore/ID
          </Link>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="bg-paper border-[5px] border-ink shadow-brutal-lg p-8 text-center font-mono text-xs uppercase tracking-widest">
            Loading...
          </div>
        ) : profile ? (
          <div className="space-y-4">
            <ProfileLink username={username} />
            <PublicProfile
              username={username}
              profile={profile}
              spores={sporesForPublicProfile}
            />
          </div>
        ) : (
          <NotFound username={username} />
        )}
      </main>
    </div>
  );
}

function NotFound({ username }: { username: string }) {
  return (
    <div className="bg-paper border-[5px] border-ink shadow-brutal-xl p-8 md:p-12 text-center">
      <div className="font-mono text-xs uppercase tracking-widest mb-3 inline-flex items-center gap-1 bg-shock text-paper px-2 py-1">
        <AtSign className="w-3.5 h-3.5" />
        404
      </div>
      <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight mb-3">
        @{username} not found
      </h1>
      <p className="font-sans text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6">
        No on-chain profile is registered for this handle on the configured
        network yet.
      </p>
      <Link
        href="/onboard"
        className="inline-block bg-shock text-paper border-[5px] border-ink py-3 px-5 font-display text-lg uppercase tracking-tight shadow-brutal-lg"
      >
        Claim @{username}
      </Link>
    </div>
  );
}
