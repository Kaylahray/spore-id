import { MintingStation } from "@/components/spore/minting-station";
import { IdGallery } from "@/components/spore/id-gallery";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="border-b-[5px] border-ink bg-acid relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-20" />
        <div className="max-w-350 mx-auto px-6 py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest mb-3 inline-block bg-ink text-acid px-2 py-1">
                Spore Protocol / v0.1
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.9] tracking-tight max-w-3xl">
                Mint your{" "}
                <span className="bg-shock text-paper px-2">identity</span> raw
                on-chain.
              </h1>
            </div>
            <div className="md:max-w-xs font-mono text-sm leading-relaxed border-l-[5px] border-ink pl-4">
              No middlemen. No metadata gymnastics. Just{" "}
              <strong>1 CKB = 1 byte</strong> of pure ownership.
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-350 mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <MintingStation />
          <IdGallery />
        </div>
      </main>

      <footer className="border-t-[5px] border-ink bg-ink text-paper mt-auto">
        <div className="max-w-350 mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="font-display text-2xl uppercase">
            Spore<span className="text-shock">/</span>ID
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-paper/60">
            Copyright 2025 - Built on Nervos CKB · No cookies · No tracking ·
            Just bytes
          </div>
        </div>
      </footer>
    </div>
  );
}
