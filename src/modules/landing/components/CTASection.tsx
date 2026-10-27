import { CTAButton } from '@/shared/components/common/CTAButton';

export function CTASection() {
  return (
    <section id="start" className="scroll-mt-16 px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-4xl rounded-2xl bg-orange-600 px-6 py-12 text-center text-white sm:px-10">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
        <p className="mx-auto mb-8 max-w-xl text-orange-50">
          Sign in with Google to enter FAAPS. Your first sign-in automatically creates a Student account.
        </p>
        <CTAButton variant="light" size="lg">Get Started</CTAButton>
      </div>
    </section>
  );
}
