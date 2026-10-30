import { useQuery } from '@tanstack/react-query';
import { studentAcademicService } from '@/modules/academic/services/studentAcademicService';
import { onboardingService } from '../../services/onboardingService';

export const ONBOARDING_KEYS = {
  profile: ['student', 'registration', 'profile'] as const,
  curriculums: ['student', 'registration', 'curriculums'] as const,
};

/** The profile tells whether registration is finished: a new Google student has no Student ID yet. */
export const useRegistrationProfile = () =>
  useQuery({
    queryKey: ONBOARDING_KEYS.profile,
    queryFn: () => studentAcademicService.profile(),
    staleTime: 60_000,
  });

export const useCurriculumChoices = () =>
  useQuery({
    queryKey: ONBOARDING_KEYS.curriculums,
    queryFn: () => onboardingService.curriculums(),
    staleTime: 5 * 60_000,
  });
