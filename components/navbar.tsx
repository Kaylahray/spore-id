"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LogOut, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import {
  useUsernameContext,
  useProfileContext,
} from "@/context/app-provider";

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { username } = useUsernameContext();
  const { profile } = useProfileContext();
  const onboardingComplete = Boolean(username && profile);
  const needsOnboarding = !username || !profile;

  const navLinks = [
    { label: "My Page", href: "/me" },
    ...(needsOnboarding ? [{ label: "Onboard", href: "/onboard" }] : []),
    ...(onboardingComplete ? [{ label: "Mint", href: "/mint" }] : []),
  ];

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
    setMobileOpen(false);
  };

  const handleDisconnect = async () => {
    await Promise.resolve(disconnect());
    setMobileOpen(false);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="border-b-[5px] border-ink bg-paper sticky top-0 z-50 relative">
      <div className="max-w-350 mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3 group min-w-0">
          <div className="w-11 h-11 bg-ink flex items-center justify-center border-[3px] border-ink relative">
            <div className="w-6 h-6 bg-acid" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-shock border-2 border-ink" />
          </div>
          <span className="font-display text-xl md:text-2xl tracking-tight uppercase truncate">
            Spore<span className="text-shock">/</span>ID
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="md:hidden bg-ink text-acid border-[3px] border-ink px-2 py-1 font-mono text-[9px] uppercase tracking-widest font-bold whitespace-nowrap">
              {Number(balance || "0").toLocaleString()} CKB
            </div>
          ) : null}
          <button
            type="button"
            className="md:hidden bg-paper border-[3px] border-ink p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

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
          <div className="hidden md:flex items-center gap-2 bg-paper border-[3px] border-ink p-1.5 pl-3 shadow-brutal">
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
            className="hidden md:flex items-center gap-2 bg-ink text-paper px-4 py-2.5 border-[3px] border-ink shadow-brutal font-mono text-xs uppercase tracking-widest"
            type="button"
            onClick={handleConnect}
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </motion.button>
        )}
      </div>
      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Close mobile menu"
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-ink/40 z-40"
          />
          <div className="md:hidden absolute left-0 right-0 top-full border-y-[3px] border-ink px-4 py-4 bg-paper space-y-3 shadow-brutal-xl z-50">
            <nav className="grid grid-cols-1 gap-2 font-mono text-xs uppercase tracking-widest">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      isActive
                        ? "px-3 py-2 border-[3px] border-ink bg-acid"
                        : "px-3 py-2 border-[3px] border-ink bg-paper"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {isConnected ? (
              <div className="bg-paper border-[3px] border-ink p-2 font-mono text-[10px] uppercase tracking-widest">
                <div className="font-bold mb-1">
                  {Number(balance || "0").toLocaleString()} CKB
                </div>
                <div className="text-muted-foreground">{formattedAddress}</div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="mt-2 w-full bg-shock text-paper border-[3px] border-ink py-2 font-mono text-[10px] uppercase tracking-widest font-bold"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                className="w-full bg-ink text-paper border-[3px] border-ink py-2.5 font-mono text-xs uppercase tracking-widest"
              >
                Connect wallet
              </button>
            )}
          </div>
        </>
      ) : null}

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
