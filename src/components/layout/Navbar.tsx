import { ShieldCheck } from "lucide-react";

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

        {/* Network status pill */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#84cc16] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#84cc16]" />
          </span>
          Base Sepolia
        </div>
      </div>
    </nav>
  );
}
