"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";

const navLinks = [
  { label: "Mint", href: "/" },
  { label: "Gallery", href: "/gallery" },
];

export function TopNav() {
  const pathname = usePathname();
  const {
    isConnected,
    connect,
    disconnect,
    formattedAddress,
    balance,
    wallet,
  } = useWallet();

  const handleConnect = async () => {
    await Promise.resolve(connect());
  };

  const handleDisconnect = async () => {
    await Promise.resolve(disconnect());
  };

  return (
    <header className="border-b-[5px] border-ink bg-paper sticky top-0 z-50">
      <div className="max-w-350 mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-ink flex items-center justify-center border-[3px] border-ink relative">
            <div className="w-6 h-6 bg-acid" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-shock border-2 border-ink" />
          </div>
          <span className="font-display text-2xl tracking-tight uppercase">
            Spore<span className="text-shock">/</span>ID
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-widest">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "px-4 py-2 border-[3px] border-ink bg-acid"
                    : "px-4 py-2 border-[3px] border-transparent hover:border-ink hover:bg-acid transition-all"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isConnected ? (
          <div className="flex items-center gap-2 bg-paper border-[3px] border-ink p-1.5 pl-3 shadow-brutal">
            <div className="flex items-center gap-2 mr-1">
              {wallet?.icon ? (
                <img
                  src={wallet.icon}
                  alt="Wallet"
                  className="w-5 h-5 border border-ink"
                />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-acid bg-ink px-2 py-1">
                {Number(balance || "0").toLocaleString()} CKB
              </span>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-widest border-l-[3px] border-ink pl-2 pr-1 py-1">
              {formattedAddress}
            </span>

            <motion.button
              whileHover={{ x: -1, y: -1 }}
              whileTap={{ x: 1, y: 1 }}
              onClick={handleDisconnect}
              className="bg-shock text-paper border-[3px] border-ink p-1.5"
              title="Disconnect Wallet"
              type="button"
            >
              <LogOut className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileHover={{ x: -2, y: -2 }}
            whileTap={{ x: 2, y: 2 }}
            className="flex items-center gap-2 bg-ink text-paper px-4 py-2.5 border-[3px] border-ink shadow-brutal font-mono text-xs uppercase tracking-widest"
            type="button"
            onClick={handleConnect}
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </motion.button>
        )}
      </div>

      <div className="border-t-[3px] border-ink bg-acid overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track py-1.5 font-mono text-xs uppercase tracking-widest font-bold">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0">
              {[
                "ON-CHAIN IDENTITY",
                "NO MIDDLEMEN",
                "STORE STATE NOT NOISE",
                "1 CKB = 1 BYTE",
                "MINT RAW. OWN IT.",
                "NAKAMOTO CONSENSUS",
              ].map((text) => (
                <span key={text} className="px-6 border-r-2 border-ink">
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
