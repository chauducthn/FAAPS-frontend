import { useSearchParams } from 'react-router';
import { SlidersHorizontal, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AttendanceConfigTab } from '../components/attendance/AttendanceConfigTab';
import { AttendanceImportTab } from '../components/attendance/AttendanceImportTab';

type Tab = 'import' | 'config';

const TABS: { key: Tab; label: string; icon: typeof Upload }[] = [
  { key: 'import', label: 'Import', icon: Upload },
  { key: 'config', label: 'Config', icon: SlidersHorizontal },
];

/** Admin attendance: import attendance data and set each course's attendance condition. */
export default function Attendance() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'config' ? 'config' : 'import';

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Attendance view"
          className="inline-flex rounded-xl border border-gray-200/80 bg-gray-100/80 p-1"
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setParams(key === 'import' ? {} : { tab: key }, { replace: true })}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold transition-all',
                  active
                    ? 'bg-white text-gray-900 shadow-2xs ring-1 ring-gray-200/70'
                    : 'text-gray-500 hover:text-gray-800',
                )}
              >
                <Icon className={cn('size-3.5', active ? 'text-[#F26F21]' : 'text-gray-400')} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'import' ? <AttendanceImportTab /> : <AttendanceConfigTab />}
    </div>
  );
}
