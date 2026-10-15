import type { Feature } from './content';

export function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
