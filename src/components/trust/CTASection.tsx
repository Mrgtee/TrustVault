export function CTASection() {
  return (
    <section className="px-4 py-24">
      <div
        className="mx-auto flex max-w-2xl flex-col items-center text-center"
        style={{ animation: "tv-fade-in-up 0.6s ease-out both" }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to see your trust score?
        </h2>
        <p className="mt-4 text-base text-white/50">
          Connect your wallet and query the graph in seconds.
        </p>
        <button className="mt-10 rounded-lg bg-[#84cc16] px-10 py-4 text-base font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(132,204,22,0.25)] active:scale-[0.98]">
          Connect &amp; Query
        </button>
        <p className="mt-6 text-xs text-white/30">
          Running on Base Sepolia testnet
        </p>
      </div>
    </section>
  );
}
