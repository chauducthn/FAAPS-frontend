import { useSearchParams } from 'react-router';
import { cn } from '@/shared/lib/utils';
import { AttendanceConfigTab } from '../components/attendance/AttendanceConfigTab';
import { AttendanceImportTab } from '../components/attendance/AttendanceImportTab';

type Tab = 'import' | 'config';

const TABS: { key: Tab; label: string }[] = [
  { key: 'import', label: 'Import' },
  { key: 'config', label: 'Config' },
];

/** Admin attendance: import attendance data and set each course's attendance condition. */
export default function Attendance() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'config' ? 'config' : 'import';

  return (
    <div className="flex w-full flex-col gap-5">
      <div>
        <p className="text-xs text-[#555f6f]">Academic Data / Attendance</p>
        <h1 className="mt-1 text-2xl font-semibold text-[#151c27]">Attendance</h1>
      </div>

      <div role="tablist" aria-label="Attendance view" className="flex flex-wrap gap-1 rounded-xl bg-white p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setParams(t.key === 'import' ? {} : { tab: t.key }, { replace: true })}
            className={cn(
              'rounded-md border-b-2 px-3 py-2 text-sm font-semibold',
              tab === t.key ? 'border-[#f37021] bg-[#fff7ed] text-[#f37021]' : 'border-transparent text-[#555f6f] hover:bg-gray-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'import' ? <AttendanceImportTab /> : <AttendanceConfigTab />}
    </div>
  );
}
