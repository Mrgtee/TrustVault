"use client";

import { ShieldCheck } from "lucide-react";
import { ConnectKitButton } from "connectkit";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#84cc16]" />
            <span className="text-lg font-bold text-white">TrustVault</span>
          </div>
          <span className="text-[10px] leading-tight text-[#84cc16]/70">
            Powered by Inco Lightning
          </span>
        </div>
        <ConnectKitButton />
      </div>
    </nav>
  );
}
