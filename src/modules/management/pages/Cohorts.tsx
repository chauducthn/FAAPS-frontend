import { useSearchParams } from 'react-router';
import { ADMIN_TAB_LIST_CLASS, adminTabClass } from '../components/AdminTabBar';
import { BookOpen, FolderOpen, GraduationCap } from '@phosphor-icons/react';
import { useCurriculum } from '../../academic/hooks/queries/useCurriculumsQuery';
import type { CurriculumItem } from '../../academic/types/curriculum';
import CurriculumManager from '../components/curriculum/CurriculumManager';
import { CohortCurriculumWorkspace } from '../components/curriculum/CohortCurriculumWorkspace';
import MajorsPage from './Majors';

type StructureTab = 'majors' | 'cohorts' | 'curriculum';

export default function CohortsPage() {
  const [params, setParams] = useSearchParams();
  const cohortId = params.get('cohortId') ?? '';
  const rawTab = params.get('tab');
  const activeTab: StructureTab =
    rawTab === 'curriculum' && cohortId
      ? 'curriculum'
      : rawTab === 'cohorts'
        ? 'cohorts'
        : 'majors';

  const selectedCohort = useCurriculum(cohortId || null);
  const curriculumLabel = selectedCohort.data
    ? `Curriculum · ${selectedCohort.data.majorCode} ${selectedCohort.data.version}`
    : 'Curriculum';

  const tabs: { key: StructureTab; label: string; icon: typeof GraduationCap; disabled?: boolean; title?: string }[] = [
    { key: 'majors', label: 'Majors', icon: GraduationCap },
    { key: 'cohorts', label: 'Cohorts', icon: FolderOpen },
    {
      key: 'curriculum',
      label: curriculumLabel,
      icon: BookOpen,
      disabled: !cohortId,
      title: !cohortId ? 'Select a cohort via Manage courses or double-click a cohort row' : undefined,
    },
  ];

  const handleSelect = (tab: StructureTab) => {
    if (tab === 'curriculum') {
      if (!cohortId) return;
      setParams({ tab: 'curriculum', cohortId }, { replace: true });
      return;
    }
    if (tab === 'cohorts') {
      setParams(cohortId ? { tab: 'cohorts', cohortId } : { tab: 'cohorts' }, { replace: true });
      return;
    }
    setParams(cohortId ? { cohortId } : {}, { replace: true });
  };

  const handleOpenCohort = (item: CurriculumItem) => {
    setParams({ tab: 'curriculum', cohortId: item.id }, { replace: true });
  };

  const tabBar = (
    <div
      role="tablist"
      aria-label="Academic structure sections"
      className={ADMIN_TAB_LIST_CLASS}
    >
      {tabs.map(({ key, label, icon: Icon, disabled, title }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            title={title}
            onClick={() => handleSelect(key)}
            className={adminTabClass(active, disabled)}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="w-full min-w-0 space-y-4">
      {activeTab === 'curriculum' && cohortId ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>{tabBar}</div>
          </div>
          <CohortCurriculumWorkspace
            cohortId={cohortId}
            onBackToCohorts={() => setParams({ tab: 'cohorts', cohortId }, { replace: true })}
          />
        </>
      ) : activeTab === 'cohorts' ? (
        <CurriculumManager kind="cohort" headerLeft={tabBar} onOpenCohort={handleOpenCohort} />
      ) : (
        <MajorsPage headerLeft={tabBar} />
      )}
    </div>
  );
}
