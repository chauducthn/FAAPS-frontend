import { FeatureCard } from './FeatureCard';
import { FEATURES } from './content';

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">Core features</h2>
          <p className="text-gray-600">Everything you need for your academic journey, in one place.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
