import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

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
