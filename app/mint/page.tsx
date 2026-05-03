import { MintingStation } from "@/components/spore/minting-station";
import { IdGallery } from "@/components/spore/id-gallery";
import { ProfileStatusBanner } from "@/components/profile/profile-status-banner";

export const metadata = {
  title: "Mint · SporeID",
  description:
    "Mint Spore identity NFTs on CKB — raw bytes, pure ownership, no middlemen.",
};

export default function MintPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="max-w-350 mx-auto px-6 py-10">
        <ProfileStatusBanner />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <MintingStation />
          <IdGallery />
        </div>
      </main>
    </div>
  );
}
