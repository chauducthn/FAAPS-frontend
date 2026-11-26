import { Navbar } from '@/modules/landing/components/Navbar';
import { Hero } from '@/modules/landing/components/Hero';
import { PlatformHighlights } from '@/modules/landing/components/PlatformHighlights';
import { Features } from '@/modules/landing/components/Features';
import { RoleShowcase } from '@/modules/landing/components/RoleShowcase';
import { HowItWorks } from '@/modules/landing/components/HowItWorks';
import { FaqSection } from '@/modules/landing/components/FaqSection';
import { CTASection } from '@/modules/landing/components/CTASection';
import { Footer } from '@/modules/landing/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-ink-primary">
      <Navbar />
      <main>
        <Hero />
        <PlatformHighlights />
        <Features />
        <RoleShowcase />
        <HowItWorks />
        <FaqSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
