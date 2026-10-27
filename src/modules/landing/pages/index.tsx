import { Navbar } from '@/modules/landing/components/Navbar';
import { Hero } from '@/modules/landing/components/Hero';
import { Features } from '@/modules/landing/components/Features';
import { CTASection } from '@/modules/landing/components/CTASection';
import { Footer } from '@/modules/landing/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
