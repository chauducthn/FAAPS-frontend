// Hook dùng chung cho Advisor: số tín chỉ bắt buộc để tốt nghiệp.
//
// Vì sao cần hook này:
//   Trước đây UI hardcode `REQUIRED_CREDITS = 132` ở nhiều file. Con số này thuộc về
//   ngành/chương trình đào tạo, không phải hằng số của ứng dụng — cứng số là sai khi
//   BE đổi quy định, và sai ngay với sinh viên thuộc chương trình khác.
//
// Nguồn dữ liệu (BE thật, không mock):
//   GET /advisor/academic/curriculums → mỗi curriculum có `totalCredits`
//   (BE tính từ `majors.total_credits`, fallback = tổng tín chỉ của `curriculum_courses`).
//
// Ánh xạ sinh viên → curriculum: `AdviseeStudent.curriculumVersion` + `majorCode`.
// Nếu BE chưa trả về (đang tải / lỗi / không khớp) → dùng `DEFAULT_REQUIRED_CREDITS`
// để UI vẫn render được thay vì crash, và thanh tiến trình hiển thị "—".

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { academicLookupService } from '../../services/academicLookupService';
import type { AdviseeStudent } from '../../types/advising';

/** Giá trị dự phòng khi BE chưa cho biết số tín chỉ yêu cầu. */
export const DEFAULT_REQUIRED_CREDITS = 120;

const CURRICULA_QUERY_KEY = ['advisor', 'academic', 'curriculums'] as const;

/**
 * Bảng tra cứu nhanh: khóa `${majorCode}::${version}` → tổng tín chỉ.
 * Khoá phụ theo `majorCode` để vẫn khớp được khi BE đổi ký hiệu version.
 */
const buildIndex = (curricula: { majorCode: string; version: string; totalCredits: number }[]) => {
  const byKey = new Map<string, number>();
  const byMajor = new Map<string, number>();
  for (const c of curricula) {
    if (c.totalCredits <= 0) continue;
    byKey.set(`${c.majorCode}::${c.version}`, c.totalCredits);
    // Nhiều phiên bản cùng ngành → lấy bản đầu tiên (BE đã sort version DESC, bản mới nhất trước).
    if (!byMajor.has(c.majorCode)) byMajor.set(c.majorCode, c.totalCredits);
  }
  return { byKey, byMajor };
};

/**
 * Trả về hàm tra số tín chỉ yêu cầu cho một sinh viên + giá trị mặc định.
 *
 * @example
 *   const { requiredCreditsFor, defaultRequiredCredits } = useRequiredCredits();
 *   const required = requiredCreditsFor(student) ?? defaultRequiredCredits;
 */
export const useRequiredCredits = () => {
  const query = useQuery({
    queryKey: CURRICULA_QUERY_KEY,
    queryFn: academicLookupService.getCurricula,
    staleTime: 5 * 60 * 1000,
  });

  const index = useMemo(() => buildIndex(query.data ?? []), [query.data]);

  /** Số tín chỉ yêu cầu của SV, hoặc `null` nếu chưa xác định được. */
  const requiredCreditsFor = (student: Pick<AdviseeStudent, 'majorCode' | 'curriculumVersion'>): number | null =>
    index.byKey.get(`${student.majorCode}::${student.curriculumVersion}`) ??
    index.byMajor.get(student.majorCode) ??
    null;

  return {
    /** Số tín chỉ yêu cầu đã biết chắc; dùng khi cần một con số duy nhất cho cả trang. */
    defaultRequiredCredits: index.byMajor.size > 0 ? index.byMajor.values().next().value ?? DEFAULT_REQUIRED_CREDITS : DEFAULT_REQUIRED_CREDITS,
    requiredCreditsFor,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
