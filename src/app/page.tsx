import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <HowItWorks />
        <ProductDemo />
        <FeatureShowcase />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
