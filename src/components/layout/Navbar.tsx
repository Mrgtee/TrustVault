"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/query", label: "Query" },
  { href: "/architecture", label: "Architecture" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex flex-col justify-center" onClick={() => setMobileOpen(false)}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#84cc16]" />
              <span className="text-lg font-bold text-white">TrustVault</span>
            </div>
            <span className="text-[10px] leading-tight text-[#84cc16]/70">
              Powered by Inco Lightning
            </span>
          </Link>

          {/* Desktop nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden text-sm transition-colors sm:block ${
                pathname === link.href
                  ? "text-white/70"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Network status pill */}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#84cc16]" />
            </span>
            <span className="hidden xs:inline">Base Sepolia</span>
            <span className="xs:hidden">Sepolia</span>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="border-t border-white/10 bg-black/95 backdrop-blur-md sm:hidden"
          style={{ animation: "tv-fade-in-up-sm 0.2s ease-out both" }}
        >
          <div className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  pathname === link.href
                    ? "bg-white/5 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
