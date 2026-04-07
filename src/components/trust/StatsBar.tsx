"use client";

import { useEffect, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 16445, suffix: "", label: "Addresses Scored" },
  { value: 16996, suffix: "", label: "Attestations" },
  { value: 2, suffix: "", label: "Scoring Algorithms" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="border-y border-white/10 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 px-4 sm:flex-row sm:gap-16">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="text-center"
            style={{ animation: `tv-fade-in-up 0.5s ease-out ${i * 0.1}s both` }}
          >
            <p className="text-3xl font-bold text-white sm:text-4xl">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-sm text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
