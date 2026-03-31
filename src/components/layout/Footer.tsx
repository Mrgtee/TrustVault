export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] py-8">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm font-semibold text-white">TrustVault</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Confidential Trust Infrastructure
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Powered by Inco Lightning
          <span className="mx-2 text-white/20">|</span>
          Intuition Protocol
        </p>
        <p className="mt-3 text-[11px] text-white/30">
          &copy; 2026 TrustVault. Built by Ludarep &times; 0xnald
        </p>
      </div>
    </footer>
  );
}
