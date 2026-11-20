import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import type { AttendanceRule } from '../../types/attendance';

const KEY = ['admin', 'attendance'] as const;

export const useAttendanceDefaultRule = () => useQuery({ queryKey: [...KEY, 'default'], queryFn: attendanceService.getDefaultRule });

export const useAttendanceOverrides = () => useQuery({ queryKey: [...KEY, 'overrides'], queryFn: attendanceService.listOverrides });

export const useAttendanceImports = () => useQuery({ queryKey: [...KEY, 'imports'], queryFn: attendanceService.listImports });

export function useAttendanceConfigMutations() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    saveDefault: useMutation({ mutationFn: attendanceService.saveDefaultRule, onSuccess: refresh }),
    saveOverride: useMutation({
      mutationFn: (v: { courseId: string; rule: AttendanceRule }) =>
        attendanceService.saveOverride(v.courseId, v.rule),
      onSuccess: refresh,
    }),
    removeOverride: useMutation({ mutationFn: attendanceService.removeOverride, onSuccess: refresh }),
  };
}

export function useAttendanceImportMutations() {
  const qc = useQueryClient();
  return {
    preview: useMutation({ mutationFn: attendanceService.previewImport }),
    confirm: useMutation({
      mutationFn: attendanceService.confirmImport,
      onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'imports'] }),
    }),
  };
}
