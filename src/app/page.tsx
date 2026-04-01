import { HeroSection } from "@/components/trust/HeroSection";
import { HowItWorks } from "@/components/trust/HowItWorks";
import { StatsBar } from "@/components/trust/StatsBar";
import { CTASection } from "@/components/trust/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <StatsBar />
      <CTASection />
    </>
  );
}
