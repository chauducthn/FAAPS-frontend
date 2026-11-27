import { Navbar } from '@/modules/landing/components/Navbar';
import { Hero } from '@/modules/landing/components/Hero';
import { PlatformHighlights } from '@/modules/landing/components/PlatformHighlights';
import { Features } from '@/modules/landing/components/Features';
import { RoleShowcase } from '@/modules/landing/components/RoleShowcase';
import { HowItWorks } from '@/modules/landing/components/HowItWorks';
import { FaqSection } from '@/modules/landing/components/FaqSection';
import { CTASection } from '@/modules/landing/components/CTASection';
import { Footer } from '@/modules/landing/components/Footer';
import { useLandingEntrance } from '@/modules/landing/hooks/useLandingEntrance';
import { cn } from '@/shared/lib/utils';

export default function LandingPage() {
  const entrance = useLandingEntrance();

  return (
    <div
      className={cn(
        'min-h-screen overflow-x-clip bg-white text-ink-primary antialiased',
        entrance === 'return' && 'landing-return',
      )}
    >
      <Navbar intro />
      <main>
        <Hero intro />
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
