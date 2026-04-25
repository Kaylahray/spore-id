import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/navbar";
import { AppProvider } from "@/context/app-provider";

export const metadata: Metadata = {
  title: "SporeID - Brutalist On-Chain Identity on CKB",
  description:
    "Mint raw, on-chain identity NFTs on Nervos CKB. No middlemen, no compromise - store state, not noise.",
  openGraph: {
    title: "SporeID - Mint Raw. Own It.",
    description: "Brutalist identity minting station for the CKB network.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <AppProvider>
            <TopNav />
            {children}
        </AppProvider>
      </body>
    </html>
  );
}
