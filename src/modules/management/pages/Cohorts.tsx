import { useSearchParams } from 'react-router';
import { FolderOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import CurriculumManager from '../components/curriculum/CurriculumManager';
import MajorsPage from './Majors';

type StructureTab = 'majors' | 'cohorts';

const TABS: { key: StructureTab; label: string; icon: typeof GraduationCap }[] = [
  { key: 'majors', label: 'Majors', icon: GraduationCap },
  { key: 'cohorts', label: 'Cohorts', icon: FolderOpen },
];

export default function CohortsPage() {
  const [params, setParams] = useSearchParams();
  const activeTab: StructureTab = params.get('tab') === 'cohorts' ? 'cohorts' : 'majors';

  const handleSelect = (tab: StructureTab) => {
    setParams(tab === 'majors' ? {} : { tab }, { replace: true });
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div
        role="tablist"
        aria-label="Academic structure sections"
        className="inline-flex items-center gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-2xs"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelect(key)}
              className={cn(
                'inline-flex h-8.5 items-center gap-2 rounded-lg px-3.5 text-[13px] font-semibold transition-colors',
                active
                  ? 'bg-[#F26F21] text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'cohorts' ? <CurriculumManager kind="cohort" /> : <MajorsPage />}
    </div>
  );
}
