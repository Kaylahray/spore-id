import { OnboardingWizard } from "@/components/profile/onboarding-wizard";

export const metadata = {
  title: "Onboard · SporeID",
  description:
    "Claim a unique handle and create your on-chain profile — your wallet is your identity on CKB.",
};

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="border-b-[5px] border-ink bg-acid relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20" />
        <div className="max-w-350 mx-auto px-6 py-10 md:py-12 relative">
          <div className="font-mono text-xs uppercase tracking-widest mb-3 inline-block bg-ink text-acid px-2 py-1">
            Start here
          </div>
          <h1 className="font-display text-4xl md:text-6xl uppercase leading-[0.9] tracking-tight max-w-3xl">
            Claim your{" "}
            <span className="bg-shock text-paper px-2">on-chain identity</span>
            .
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-xs md:text-sm uppercase tracking-widest text-ink/80 leading-relaxed">
            Connect your wallet, reserve a handle, and publish a profile cell —
            locked to you, readable by anyone. No account server.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <OnboardingWizard />
      </main>
    </div>
  );
}
