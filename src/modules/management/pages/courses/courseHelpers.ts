import type { SortingState } from '@tanstack/react-table';
import { isAllowedCredits } from '../../utils/importChecks';
import type { CourseFilterParams, CourseImportPreview } from '../../../academic/types/course';
import {
  CREDIT_OPTIONS_MESSAGE,
  type CreateCourseFormValues,
} from '../../../academic/validations/course.schema';

export const COURSE_PAGE_SIZE = 10;

/**
 * The backend accepts 1-30 credits on import; the catalogue rule is CREDIT_OPTIONS.
 * Other values are marked as errors so they are never confirmed
 * (needed for .xls files, which are not checked before upload).
 */
export function withCreditLimit(preview: CourseImportPreview): CourseImportPreview {
  const message = CREDIT_OPTIONS_MESSAGE;
  const items = preview.items.map((item) =>
    !isAllowedCredits(item.credits) && !item.errors.includes(message)
      ? { ...item, status: 'ERROR', errors: [...item.errors, message] }
      : item,
  );
  const errorRows = items.filter((i) => i.errors.length > 0).length;
  return { ...preview, items, errorRows, validRows: items.length - errorRows };
}

/** Form values to the request body. The syllabus texts are not sent, so editing keeps what is stored. */
export function toCourseBody(values: CreateCourseFormValues, isCreate: boolean) {
  const body = {
    code: values.code,
    name: values.name,
    credits: values.credits,
    categoryId: values.categoryId,
    status: values.status,
    materialLink: values.materialLink ? values.materialLink : null,
  };
  if (!isCreate) return body;
  return {
    ...body,
    prerequisites: (values.prerequisiteIds ?? []).map((id, i) => ({
      prerequisiteCourseId: id,
      groupNo: i + 1,
      type: 'PREREQUISITE' as const,
    })),
  };
}

const COURSE_SORT_FIELDS = new Set([
  'code',
  'name',
  'credits',
  'categoryCode',
  'categoryName',
  'prerequisiteCount',
  'status',
  'createdAt',
]);

export function toCourseSort(sorting: SortingState): NonNullable<CourseFilterParams['sort']> {
  const active = sorting[0];
  if (!active || !COURSE_SORT_FIELDS.has(active.id)) return 'code,asc';
  const dir = active.desc ? 'desc' : 'asc';
  return `${active.id},${dir}` as NonNullable<CourseFilterParams['sort']>;
}

export function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
