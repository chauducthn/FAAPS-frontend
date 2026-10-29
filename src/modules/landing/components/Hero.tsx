import { ArrowRight } from 'lucide-react';
import { CTAButton } from '@/shared/components/common/CTAButton';

export function Hero() {
  return (
    <section id="about" className="scroll-mt-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="mb-4 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          Academic Advising &amp; Planning System
        </span>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          FPT Academic Advising <span className="text-orange-600">System</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base text-gray-600 sm:text-lg">
          FAAPS helps students plan their studies, track graduation progress and get advice directly from AI
          and academic advisors.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <CTAButton to="/register" size="lg">
            Get Started <ArrowRight className="size-5" />
          </CTAButton>
          <CTAButton size="lg" variant="outline">Sign in</CTAButton>
        </div>
        <p className="mt-4 text-xs text-gray-500">Sign in with your Google account. No separate password needed.</p>
      </div>
    </section>
  );
}
