# PROMPT — Student Portal & Advisor Portal (FAAPS Frontend)

> Copy nguyên khối dưới đây để giao việc. Bổ sung vào cuối phần "Bối cảnh" nếu backend đã có endpoint thật.

---

## Bối cảnh

Dự án `FAAPS-frontend` (React 19 + TypeScript + Vite + Tailwind v4 + TanStack Query v5 + react-hook-form + zod).

Nhiệm vụ này dựng trọn **Student Portal** và **Advisor Portal** theo schema DB hiện tại (file `.md` ở thư mục gốc — đọc trước khi code, đặc biệt **Group 4: Students & Advisors**, **Group 8: Advising**, **Group 11: System**).

Backend cho các endpoint dưới đây **chưa có** → làm fake data (mock) để xem thử UI trước, nhưng **service phải gọi API thật khi tắt mock**, đúng pattern `src/services/admin/ai-config.service.ts`.

---

## 0. Quy tắc bắt buộc (bám sát code hiện có)

| Mục | Quy ước |
| --- | --- |
| Kiểu dữ liệu | Đặt trong `src/types/`, mỗi domain 1 file, export `interface` + union type. Không dùng `any`. |
| Service | `src/services/*.ts`, gọi `apiClient` từ `src/lib/apiClient`. Mọi request ghi (POST/PUT/PATCH/DELETE) **phải** kèm `await getCsrfHeaders()` (`src/lib/csrf.ts`). |
| Hooks | Query: `src/hooks/queries/use*.ts`. Mutation: `src/hooks/mutations/use*.ts`. Luôn khai báo query key gom về 1 object dùng chung. |
| Form | `react-hook-form` + `zodResolver`, schema đặt ở `src/validations/<domain>.schema.ts`. |
| Lỗi API | Dùng `apiErrorMessage(error, fallback)` từ `src/lib/apiError.ts` trong `onError` của mutation. Toast dùng `sonner` (`toast.success` / `toast.error`). |
| Auth | `const user = useAuth((s) => s.user)` từ `src/stores/useAuth.ts`. |
| Style | Tailwind dùng token của dự án: cam thương hiệu `#F26F21`, chữ chính `#151c27`, chữ phụ `#555f6f`, nền `#f7f8fa`, viền `#e5e7eb`. Dùng `cn()` từ `@/lib/utils`. |
| Component dùng lại | `src/components/ui/Modal.tsx`, `src/components/admin/RowActionMenu.tsx`, `src/components/admin/StatusBadge.tsx`, `src/components/admin/Pagination.tsx`, `src/components/common/Logo.tsx`. |
| Tiện ích ngày giờ | `src/lib/appointmentDate.ts` (`formatIsoDay`, `formatIsoTime`, `toDateKey`, `ISO_WEEKDAY_LABELS`…). |
| Debounce | `src/hooks/useDebounce.ts` → `useDebounce(value, delay = 300)`. |
| Phân trang | `src/components/admin/Pagination.tsx` → `<Pagination page={0-based} pageSize total noun="students" onChange={...} bare />`. |
| Import | Có thể dùng alias `@/` (đã cấu hình trong `tsconfig.json` + `vite.config.ts`) hoặc import tương đối — **giữ đúng style của file đang sửa**. |
| Comment | Tiếng Việt cho phần giải thích nghiệp vụ; tiếng Anh cho comment kỹ thuật ngắn. |
| Kiểm tra | `npx tsc --noEmit` phải pass (script `build` chạy `tsc --noEmit && vite build`). |

**Không được** tự tạo lại `apiClient`, không hard-code URL tuyệt đối (dùng path tương đối, `apiClient` đã có `baseURL = VITE_API_URL || '/api'`), không bỏ qua CSRF header.

---

## 1. Model dữ liệu (bám sát `.md`)

### 1.1 Bảng liên quan

| Bảng | Dùng cho |
| --- | --- |
| `users` | `full_name`, `email`, `phone`, `status` |
| `students` | `student_code`, `current_gpa` (thang **10.00**), `total_credits_earned`, `current_semester`, `academic_status`, `major_id`, `curriculum_version_id`, `enrollment_semester_id` |
| `advisors` | `advisor_code`, `specialization`, `max_advisees`, `status`, `work_days`, `assignment_start_date` |
| `student_advisor_assignments` | `student_id`, `advisor_id`, `is_primary`, `status`, `assigned_date`, `group_name` |
| `advising_requests` | `request_type`, `title`, `description`, `status`, `advisor_id` (NULL tới khi advisor nhận), `study_plan_id`, `resolved_at`, `resolution_summary` |
| `advising_messages` | (mở rộng) `advising_request_id`, `sender_user_id`, `content`, `is_internal` |
| `notifications` | `recipient_user_id`, `notification_type`, `title`, `message`, `action_url`, `related_student_id`, `is_read`, `read_at` |
| `majors` / `curriculum_versions` / `semesters` | `code`, `name`, `version` (mã cohort, vd `K19`), `is_current` |

### 1.2 ⚠️ Điểm quan trọng: map trạng thái Chấp nhận / Từ chối

DB **không có** `ACCEPTED` / `REJECTED` trong `advising_requests.status`. Enum chỉ gồm `PENDING | IN_PROGRESS | RESOLVED | CANCELLED`.

| Nút trên UI | Giá trị ghi vào `advising_requests.status` | Ghi kèm |
| --- | --- | --- |
| **Chấp nhận** | `RESOLVED` | `resolved_at = now`, `resolution_summary` = ghi chú của cố vấn (có thể rỗng) |
| **Từ chối** | `CANCELLED` | `resolved_at = now`, `resolution_summary` = **bắt buộc** (lý do, student phải đọc được) |
| **Tiếp nhận xử lý** (tuỳ chọn) | `IN_PROGRESS` | `advisor_id` = user hiện tại |

> Cấm tạo status mới không có trong DB. Cấm hiển thị chuỗi `ACCEPTED`/`REJECTED` cho người dùng — label UI là "Chấp nhận" / "Từ chối".

### 1.3 File type mới: `src/types/advising.ts`

```ts
// src/types/advising.ts
// Types for the Student Portal / Advisor Portal.
// Mỗi field ánh xạ 1-1 với cột của schema MySQL (xem .md):
// advising_requests, students, advisors, student_advisor_assignments, notifications.

/** advising_requests.request_type */
export type AdvisingRequestType =
  | 'PLAN_REVIEW'
  | 'COURSE_SELECTION'
  | 'ACADEMIC_GUIDANCE'
  | 'GRADUATION_CHECK'
  | 'OTHER';

/** advising_requests.status — DB không có ACCEPTED/REJECTED. */
export type AdvisingRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/** Các trạng thái advisor được chuyển request sang. */
export type AdvisingRequestDecision = 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

/** students.academic_status */
export type AcademicStatus =
  | 'ACTIVE'
  | 'PROBATION'
  | 'SUSPENDED'
  | 'GRADUATED'
  | 'WITHDRAWN'
  | 'LEAVE_OF_ABSENCE';

/** advisors.status */
export type AdvisorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

/** notifications.notification_type */
export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'REMINDER'
  | 'PLAN_STATUS'
  | 'MESSAGE'
  | 'ADVISOR_REQUEST';

/** Hồ sơ học tập của sinh viên hiện tại (students + users + majors + curriculum_versions + semesters). */
export interface StudentProfile {
  /** students.user_id */
  id: string;
  /** students.student_code */
  studentCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** users.phone */
  phone: string | null;
  /** majors.id */
  majorId: string | null;
  /** majors.code */
  majorCode: string | null;
  /** majors.name */
  majorName: string | null;
  /** curriculum_versions.id */
  curriculumVersionId: string | null;
  /** curriculum_versions.version — mã cohort, vd "K19" */
  curriculumVersion: string | null;
  /** semesters.code của students.enrollment_semester_id */
  enrollmentSemesterCode: string | null;
  /** students.current_semester */
  currentSemester: number;
  /** students.current_gpa — thang 10.00 (0.00 - 10.00), KHÔNG quy đổi sang 4.0 */
  currentGpa: number | null;
  /** students.total_credits_earned */
  totalCreditsEarned: number;
  /** students.academic_status */
  academicStatus: AcademicStatus;
}

/**
 * Cố vấn phụ trách của sinh viên hiện tại.
 * advisors + users + student_advisor_assignments (is_primary = true, status = 'ACTIVE').
 */
export interface AdvisorInfo {
  /** advisors.user_id */
  id: string;
  /** advisors.advisor_code */
  advisorCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** users.phone */
  phone: string | null;
  /** advisors.specialization */
  specialization: string | null;
  /** advisors.max_advisees */
  maxAdvisees: number;
  /** advisors.status */
  status: AdvisorStatus;
  /** advisors.work_days — ISO weekday csv, vd "1,2,3,4,5" (1 = Monday) */
  workDays: string | null;
  /** advisors.assignment_start_date — yyyy-MM-dd */
  assignmentStartDate: string | null;
  /** student_advisor_assignments.assigned_date — yyyy-MM-dd */
  assignedDate: string | null;
  /** student_advisor_assignments.group_name */
  groupName: string | null;
  /** student_advisor_assignments.is_primary */
  isPrimary: boolean;
}

/** Sinh viên được phân công cho advisor hiện tại. */
export interface AdviseeStudent {
  /** students.user_id */
  id: string;
  /** students.student_code */
  studentCode: string;
  /** users.full_name */
  fullName: string;
  /** users.email */
  email: string;
  /** majors.code */
  majorCode: string;
  /** majors.name */
  majorName: string;
  /** curriculum_versions.version — mã cohort, vd "K19" */
  curriculumVersion: string;
  /** students.current_semester */
  currentSemester: number;
  /** students.current_gpa — thang 10.00 (0.00 - 10.00), KHÔNG quy đổi sang 4.0 */
  currentGpa: number | null;
  /** students.total_credits_earned */
  totalCreditsEarned: number;
  /** students.academic_status */
  academicStatus: AcademicStatus;
  /** semesters.code của students.enrollment_semester_id */
  enrollmentSemesterCode: string | null;
  /** student_advisor_assignments.assigned_date — yyyy-MM-dd */
  assignedDate: string | null;
  /** student_advisor_assignments.group_name */
  groupName: string | null;
  /** student_advisor_assignments.is_primary */
  isPrimary: boolean;
}

/** Một yêu cầu tư vấn (advising_requests + tên student/advisor). */
export interface AdvisingRequest {
  id: string;
  /** students.user_id */
  studentId: string;
  studentName: string;
  studentCode: string | null;
  /** advisors.user_id — NULL tới khi có advisor nhận request */
  advisorId: string | null;
  advisorName: string | null;
  /** study_plans.id — plan mà request nói về (nullable) */
  studyPlanId: string | null;
  requestType: AdvisingRequestType;
  title: string;
  description: string | null;
  status: AdvisingRequestStatus;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  /** ISO-8601 */
  createdAt: string;
  updatedAt: string;
}

/** Một notification của user hiện tại (notifications). */
export interface StudentNotification {
  id: string;
  /** notifications.recipient_user_id */
  recipientUserId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  /** notifications.action_url — in-app path, vd "/student/advising-requests" */
  actionUrl: string | null;
  /** students.user_id */
  relatedStudentId: string | null;
  resolvedAt: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** Body của POST /student/advising-requests */
export interface CreateAdvisingRequestDto {
  requestType: AdvisingRequestType;
  /** advising_requests.title — varchar(255), not null */
  title: string;
  /** advising_requests.description — text, nullable */
  description?: string;
  /** advising_requests.study_plan_id — nullable */
  studyPlanId?: string;
}

/** Body của PUT /advisor/advising-requests/{id}/status */
export interface UpdateAdvisingRequestStatusDto {
  /** RESOLVED = Chấp nhận, CANCELLED = Từ chối, IN_PROGRESS = Tiếp nhận xử lý. */
  status: AdvisingRequestDecision;
  /** advising_requests.resolution_summary — text, nullable. Bắt buộc khi Từ chối. */
  resolutionSummary?: string;
}
```

### 1.4 Bổ sung type phân trang dùng chung

`src/types/api.ts` — thêm vào (để không lặp shape với `AdminPage`):

```ts
/** Kết quả phân trang chuẩn của backend. */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

Trong `src/types/admin.ts`, đổi `AdminPage<T>` thành alias để không trùng shape (giữ nguyên mọi nơi đang dùng):

```ts
import type { Page } from './api';
export type AdminPage<T> = Page<T>;
```

---

## 2. Service layer

### 2.1 `src/services/studentService.ts`

```ts
// src/services/studentService.ts
import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type { Page } from '../types/api';
import type {
  AdvisorInfo,
  AdvisingRequest,
  CreateAdvisingRequestDto,
  StudentNotification,
  StudentProfile,
} from '../types/advising';

export const studentService = {
  /** Hồ sơ học tập của chính sinh viên. */
  getMyProfile: async (): Promise<StudentProfile> =>
    (await apiClient.get<StudentProfile>('/student/profile')).data,

  /** Cố vấn phụ trách (student_advisor_assignments.is_primary = true). null nếu chưa được phân công. */
  getMyAdvisor: async (): Promise<AdvisorInfo | null> =>
    (await apiClient.get<AdvisorInfo | null>('/student/advisor')).data ?? null,

  /** Thông báo của chính sinh viên. */
  getNotifications: async (
    params: { unreadOnly?: boolean; page?: number; size?: number } = {},
  ): Promise<Page<StudentNotification>> =>
    (await apiClient.get<Page<StudentNotification>>('/student/notifications', { params })).data,

  /** Đánh dấu 1 thông báo đã đọc. */
  markNotificationRead: async (id: string): Promise<{ updated: boolean }> =>
    (
      await apiClient.patch<{ updated: boolean }>(`/student/notifications/${id}/read`, null, {
        headers: await getCsrfHeaders(),
      })
    ).data,

  /** Đánh dấu toàn bộ thông báo đã đọc. */
  markAllNotificationsRead: async (): Promise<{ updated: number }> =>
    (
      await apiClient.patch<{ updated: number }>('/student/notifications/read-all', null, {
        headers: await getCsrfHeaders(),
      })
    ).data,

  /** Các yêu cầu tư vấn của chính sinh viên. */
  getMyAdvisingRequests: async (): Promise<AdvisingRequest[]> =>
    (await apiClient.get<AdvisingRequest[]>('/student/advising-requests')).data ?? [],

  /** Gửi yêu cầu tư vấn mới. */
  createAdvisingRequest: async (body: CreateAdvisingRequestDto): Promise<AdvisingRequest> =>
    (
      await apiClient.post<AdvisingRequest>('/student/advising-requests', body, {
        headers: await getCsrfHeaders(),
      })
    ).data,
};
```

### 2.2 `src/services/advisorService.ts`

```ts
// src/services/advisorService.ts
import { apiClient } from '../lib/apiClient';
import { getCsrfHeaders } from '../lib/csrf';
import type { Page } from '../types/api';
import type {
  AdviseeStudent,
  AdvisingRequest,
  AdvisingRequestStatus,
  UpdateAdvisingRequestStatusDto,
} from '../types/advising';

export const advisorService = {
  /** Sinh viên được phân công cho advisor hiện tại (student_advisor_assignments.status = 'ACTIVE'). */
  getAdviseeStudents: async (
    params: { search?: string; page?: number; size?: number } = {},
  ): Promise<Page<AdviseeStudent>> =>
    (await apiClient.get<Page<AdviseeStudent>>('/advisor/students', { params })).data,

  /** Yêu cầu tư vấn mà advisor nhận xử lý. */
  getAdvisingRequests: async (
    params: { status?: AdvisingRequestStatus; search?: string; page?: number; size?: number } = {},
  ): Promise<Page<AdvisingRequest>> =>
    (await apiClient.get<Page<AdvisingRequest>>('/advisor/advising-requests', { params })).data,

  /** Chuyển trạng thái request: RESOLVED = Chấp nhận, CANCELLED = Từ chối. */
  updateRequestStatus: async (
    id: string,
    body: UpdateAdvisingRequestStatusDto,
  ): Promise<AdvisingRequest> =>
    (
      await apiClient.put<AdvisingRequest>(`/advisor/advising-requests/${id}/status`, body, {
        headers: await getCsrfHeaders(),
      })
    ).data,
};
```

> Endpoint nào backend chưa có thì `apiClient` sẽ ném lỗi — **bắt buộc** bọc mock bên dưới (mục 4) để UI chạy được khi demo.

---

## 3. Hooks

### 3.1 `src/hooks/queries/useStudentQueries.ts`

```ts
export const STUDENT_QUERY_KEYS = {
  all: ['student'] as const,
  profile: ['student', 'profile'] as const,
  advisor: ['student', 'advisor'] as const,
  notifications: (page: number, size: number, unreadOnly: boolean) =>
    ['student', 'notifications', page, size, unreadOnly] as const,
  advisingRequests: ['student', 'advising-requests'] as const,
};
```

- `useMyProfile()` → `useQuery({ queryKey: STUDENT_QUERY_KEYS.profile, queryFn: studentService.getMyProfile })`
- `useMyAdvisor()` → `useQuery({ queryKey: STUDENT_QUERY_KEYS.advisor, queryFn: studentService.getMyAdvisor })`
- `useStudentNotifications(page, size, unreadOnly?)` → có `placeholderData: keepPreviousData`
- `useUnreadStudentNotificationCount()` → gọi list với `unreadOnly: true, size: 1`, lấy `totalElements`
- `useMyAdvisingRequests()` → `useQuery({ queryKey: STUDENT_QUERY_KEYS.advisingRequests, queryFn: studentService.getMyAdvisingRequests })`

### 3.2 `src/hooks/queries/useAdvisorQueries.ts`

```ts
export const ADVISOR_QUERY_KEYS = {
  all: ['advisor'] as const,
  students: (params: { search?: string; page: number; size: number }) =>
    ['advisor', 'students', params] as const,
  advisingRequests: (params: { status?: AdvisingRequestStatus; search?: string; page: number; size: number }) =>
    ['advisor', 'advising-requests', params] as const,
};
```

- `useAdviseeStudents(params)`
- `useAdvisorAdvisingRequests(params)`

### 3.3 `src/hooks/mutations/useAdvisingMutations.ts`

- `useCreateAdvisingRequest()` — `mutationFn: studentService.createAdvisingRequest`; `onSuccess`: `toast.success('Đã gửi yêu cầu tư vấn')` + `invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all })`; `onError`: `toast.error(apiErrorMessage(error, 'Không gửi được yêu cầu.'))`.
- `useUpdateAdvisingRequestStatus()` — `mutationFn: ({ id, body }) => advisorService.updateRequestStatus(id, body)`; `onSuccess`: toast theo `body.status` (`RESOLVED` → "Đã chấp nhận yêu cầu", `CANCELLED` → "Đã từ chối yêu cầu") + `invalidateQueries({ queryKey: ADVISOR_QUERY_KEYS.all })`; `onError`: `toast.error(apiErrorMessage(error, 'Không cập nhật được yêu cầu.'))`.
- `useMarkStudentNotificationRead()` / `useMarkAllStudentNotificationsRead()` — invalidate `STUDENT_QUERY_KEYS.notifications`.

---

## 4. Mock data (để xem thử UI)

### 4.1 Mở rộng cơ chế mock hiện có

`src/mocks/index.ts` đang chỉ hỗ trợ 1 scope AI (`VITE_MOCK_AI` / `faaps.mock-ai`). Refactor thành 2 scope, **giữ nguyên export cũ** để không phá code AI:

```ts
export const isMockAiEnabled = () => ...;     // giữ nguyên
export const toggleMockAi = () => ...;         // giữ nguyên
export const useMockAi = () => ...;             // giữ nguyên

// scope mới cho Student/Advisor Portal
export const isMockPortalEnabled = () => ...;   // env VITE_MOCK_PORTAL, localStorage 'faaps.mock-portal', mặc định BẬT
export const toggleMockPortal = () => ...;
export const useMockPortal = () => ...;
```

Gợi ý: gom logic vào một factory `createScope(scope, envKey, storageKey)` trả về `{ enabled, toggle, use }` dùng `useSyncExternalStore` — tránh copy logic 2 lần.

`src/components/admin/MockDataToggle.tsx` — generalize thêm prop `scope?: 'ai' | 'portal'` (mặc định `'ai'`), nút hiện "Demo data" / "Live API" như hiện tại. `MockDataBanner` giữ nguyên.

### 4.2 `src/mocks/advising.ts`

Seed data tối thiểu:

- 1 `AdvisorInfo` (cố vấn phụ trách của sinh viên demo).
- 1 `StudentProfile` (hồ sơ của sinh viên demo).
- 6 `AdviseeStudent` (khác `academic_status`, `current_gpa` trong khoảng 3.20 – 9.40, thang 10).
- 5 `AdvisingRequest` (đủ cả `PENDING`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`; `advisorId` có `null` ở ít nhất 1 cái để giống DB).
- 6 `StudentNotification` (đủ `INFO`, `WARNING`, `REMINDER`, `PLAN_STATUS`, `MESSAGE`, `ADVISOR_REQUEST`; vài cái `isRead: false`).

Yêu cầu mock:

- Dùng **PRNG ổn định** (seed theo string) giống `src/mocks/ai.ts` để số liệu không nhảy mỗi lần render.
- Giữ state cục bộ trong module để thao tác **Chấp nhận / Từ chối** và **Gửi yêu cầu** có hiệu lực thật trong phiên (giống `localConfigs` của `ai-config.service.ts`).
- Export các hàm: `mockGetMyProfile()`, `mockGetMyAdvisor()`, `mockGetNotifications(params)`, `mockGetMyAdvisingRequests()`, `mockCreateAdvisingRequest(body)`, `mockGetAdviseeStudents(params)`, `mockGetAdvisorRequests(params)`, `mockUpdateRequestStatus(id, body)` — trả về đúng shape `Page<T>` / `AdvisingRequest`.
- Khi `updateRequestStatus` được gọi: cập nhật `status`, `resolvedAt`, `resolutionSummary`, `updatedAt` theo đúng mapping mục 1.2.

### 4.3 Bọc mock trong service

Trong `studentService` / `advisorService`, mỗi hàm kiểm tra `isMockPortalEnabled()` trước khi gọi API:

```ts
getMyProfile: async () => {
  if (isMockPortalEnabled()) return mockGetMyProfile();
  return (await apiClient.get<StudentProfile>('/student/profile')).data;
},

getMyAdvisor: async () => {
  if (isMockPortalEnabled()) return mockGetMyAdvisor();
  return (await apiClient.get<AdvisorInfo | null>('/student/advisor')).data ?? null;
},
```

Giữ nguyên export cũ của service, không đổi chữ ký.

---

## 5. Student Portal (`src/pages/student/`)

### 5.1 Layout chuẩn — `src/components/layout/student/`

Tạo 3 file, **copy nguyên cấu trúc `src/components/layout/admin/AdminLayout.tsx`** (sidebar trượt dọc, header sticky, menu mobile overlay, dropdown đăng xuất):

| File | Nội dung |
| --- | --- |
| `StudentLayout.tsx` | `<Outlet />` trong `<main className="min-w-0 flex-1 p-4 sm:p-8">`, nền `bg-[#f7f8fa]`, header 1 hàng, sidebar `w-[248px]`. Đăng xuất qua `authService.logout()` + `useAuth().logout()` (giống `AdminLayout`). |
| `StudentSidebar.tsx` | Nav items: `Trang chủ` → `/student` (icon `LayoutDashboard`), `Yêu cầu tư vấn` → `/student/advising-requests` (icon `MessageSquareText`), `Đặt lịch hẹn` → `/student/appointments` (icon `CalendarClock`). Dùng `NavLink` với style active viền cam `#f37021` + nền `#fff7ed` như `AdminLayout`. |
| `StudentHeader.tsx` | `Logo` (link `/student`), `StudentNotificationBell` (mục 5.2), avatar + tên + role `STUDENT`, dropdown có nút `Sign out`. |

> `StudentNotificationBell.tsx` đặt cùng thư mục, dựng theo mẫu `src/components/layout/admin/NotificationBell.tsx` nhưng dùng `useStudentNotifications` / `useUnreadStudentNotificationCount` / `useMarkStudentNotificationRead`. Badge đếm số chưa đọc.

### 5.2 Dashboard Sinh viên — `src/pages/student/StudentPortal.tsx` (viết lại)

Bố cục (theo thứ tự):

1. **Header trang**: "Xin chào, {fullName}" + breadcrumb nhỏ `Student / Dashboard`.
2. **Card hồ sơ học tập** (dùng `useMyProfile()`): `studentCode`, `majorCode/majorName`, `curriculumVersion` (cohort), `currentSemester`, `currentGpa` (**hiển thị `8.35/10`**), `totalCreditsEarned`, `academicStatus`.
3. **`AdvisorInfoCard`** — `src/components/student/AdvisorInfoCard.tsx`:
   - Hiện `fullName`, `advisorCode`, `email`, `phone`, `specialization`, `workDays` (map `1..7` → `Mon..Sun` giống `ISO_WEEKDAY_LABELS` trong `src/lib/appointmentDate.ts`), `assignedDate`, `groupName`.
   - Trạng thái `advisors.status`: `ACTIVE` → badge xanh, `INACTIVE` → xám, `ON_LEAVE` → badge cảnh báo.
   - Nút phụ `Gửi yêu cầu tư vấn` → `Link` tới `/student/advising-requests`.
   - Nếu chưa được phân công cố vấn: hiện empty state "Bạn chưa được phân công cố vấn" + hướng dẫn liên hệ admin.
4. **`NotificationList`** — `src/components/student/NotificationList.tsx`:
   - Danh sách thông báo (dùng `useStudentNotifications`), unread in đậm + nền `#fff7ed`.
   - Icon/label theo `notificationType` (`INFO` → `Info`, `WARNING` → `AlertTriangle`, `REMINDER` → `Clock`, `PLAN_STATUS` → `ClipboardCheck`, `MESSAGE` → `MessageSquare`, `ADVISOR_REQUEST` → `UserPlus`).
   - Click 1 thông báo → `markNotificationRead` + điều hướng tới `actionUrl` nếu có.
   - Nút "Đánh dấu tất cả đã đọc".
   - Phân trang dùng `src/components/admin/Pagination.tsx` (`noun="notifications"`), `page` zero-based.
   - Trạng thái loading / error / rỗng đều phải có.

Giữ lại link tới `/student/appointments` (đã có sẵn) dưới dạng card nhỏ hoặc trong sidebar — **không xoá** trang `BookAppointment`.

### 5.3 Form "Gửi yêu cầu tư vấn" — `src/components/student/AdvisingRequestForm.tsx`

- Schema `src/validations/advising.schema.ts`:

```ts
import { z } from 'zod';

export const REQUEST_TYPES = [
  'PLAN_REVIEW',
  'COURSE_SELECTION',
  'ACADEMIC_GUIDANCE',
  'GRADUATION_CHECK',
  'OTHER',
] as const;

export const createAdvisingRequestSchema = z.object({
  requestType: z.enum(REQUEST_TYPES, { message: 'Chọn loại yêu cầu' }),
  title: z.string().trim().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(255, 'Tối đa 255 ký tự'),
  description: z.string().trim().max(2000, 'Tối đa 2000 ký tự').optional(),
  studyPlanId: z.string().uuid('Mã kế hoạch học tập không hợp lệ').optional().or(z.literal('')),
});

export type CreateAdvisingRequestFormValues = z.infer<typeof createAdvisingRequestSchema>;
```

- Trường form:
  - `Loại yêu cầu` — `<select>` với nhãn tiếng Việt:
    `PLAN_REVIEW` → "Duyệt kế hoạch học tập", `COURSE_SELECTION` → "Chọn môn học", `ACADEMIC_GUIDANCE` → "Hướng dẫn học thuật", `GRADUATION_CHECK` → "Kiểm tra điều kiện tốt nghiệp", `OTHER` → "Khác".
  - `Tiêu đề` — text, bắt buộc, max 255, hiện counter.
  - `Mô tả chi tiết` — textarea, tối đa 2000, hiện counter.
  - `Kế hoạch học tập liên quan` — select (tuỳ chọn), nạp danh sách plan của sinh viên nếu backend có; nếu chưa có API thì để select disabled kèm ghi chú "Chưa có kế hoạch học tập nào" — **không bắt nhập tay UUID**.
- Validate bằng `zodResolver`, hiện lỗi inline dưới field (màu đỏ, `text-[11px]`) như `CurriculumFormModal`.
- Submit → `useCreateAdvisingRequest().mutate(values)`. Disable nút khi đang submit, text nút đổi thành "Đang gửi...".
- Thành công → reset form + toast (mutation lo).

### 5.4 Trang "Yêu cầu tư vấn" — `src/pages/student/AdvisingRequests.tsx` (mới)

- Cột trái: `AdvisingRequestForm`.
- Cột phải: danh sách các yêu cầu của sinh viên (`useMyAdvisingRequests`), mỗi item hiện `title`, label loại yêu cầu, badge trạng thái, `createdAt`, và nếu `status` là `RESOLVED`/`CANCELLED` thì hiện `resolutionSummary` của cố vấn (ghi chú "Cố vấn đã phản hồi").
- Badge trạng thái: `PENDING` → cam, `IN_PROGRESS` → xanh dương, `RESOLVED` → xanh lá, `CANCELLED` → đỏ.

Tạo badge dùng chung ở `src/components/advising/RequestStatusBadge.tsx` và `src/components/advising/RequestTypeLabel.tsx` (dùng chung cho student + advisor).

---

## 6. Advisor Portal (`src/pages/advisor/`)

### 6.1 Layout chuẩn — `src/components/layout/advisor/`

Copy cấu trúc `StudentLayout` (hoặc tách phần chung nếu muốn giảm lặp — nếu tách thì đặt `src/components/layout/portal/PortalLayout.tsx` và truyền `navSections` + `homePath`).

| File | Nội dung |
| --- | --- |
| `AdvisorLayout.tsx` | Giống `StudentLayout` nhưng nav theo advisor. |
| `AdvisorSidebar.tsx` | `Tổng quan` → `/advisor` (`LayoutDashboard`), `Yêu cầu tư vấn` → `/advisor/advising-requests` (`Inbox`), `Lịch hẹn` → `/advisor/appointments` (`CalendarDays`). |
| `AdvisorHeader.tsx` | `Logo`, badge "Demo data" (mock toggle scope portal), avatar + tên + role `ADVISOR`, dropdown `Sign out`. |

### 6.2 Dashboard Cố vấn — `src/pages/advisor/AdvisorPortal.tsx` (viết lại)

1. **Header trang**: "Xin chào, {fullName}" + subtitle "Quản lý sinh viên được phân công và yêu cầu tư vấn".
2. **4 thẻ số liệu**: Tổng SV được phân công · Yêu cầu đang chờ (`PENDING`) · Đang xử lý (`IN_PROGRESS`) · Đã xử lý (`RESOLVED`). Lấy từ `useAdvisorAdvisingRequests` + `useAdviseeStudents`.
3. **`StudentList`** — `src/components/advisor/StudentList.tsx`:
   - Bảng: `Mã SV` · `Họ tên` · `Cohort` · `Chuyên ngành` · `Học kỳ` · `GPA (/10)` · `Tín chỉ` · `Trạng thái` · `Ngày phân công`.
   - `currentGpa` hiển thị 2 chữ số + `/10`.
   - `academicStatus`: `ACTIVE` → xanh lá, `PROBATION` → cam, `SUSPENDED` → đỏ, `GRADUATED` → xanh dương, `WITHDRAWN`/`LEAVE_OF_ABSENCE` → xám.
   - Ô tìm kiếm (search theo tên / mã SV) dùng `useDebounce(search.trim())` (~300ms), điều khiển qua `useAdviseeStudents({ search, page, size })`.
   - Phân trang dùng component có sẵn `src/components/admin/Pagination.tsx` (`page` zero-based, `pageSize`, `total = totalElements`, `noun="students"`, `bare`) — **không tự viết lại** ô phân trang. Kèm `placeholderData: keepPreviousData` để không nhảy layout.
   - Trạng thái loading (skeleton giống `TableState` trong `src/pages/admin/assignments/AssignmentsOverview.tsx`), error (kèm nút Retry), rỗng ("Chưa có sinh viên nào được phân công").
4. **`RequestListTable`** — `src/components/advisor/RequestListTable.tsx`:
   - Bảng: `Sinh viên` (tên + mã) · `Loại` · `Tiêu đề` · `Mô tả` (rút gọn 1 dòng, click xem đầy đủ) · `Ngày gửi` · `Trạng thái` · `Thao tác`.
   - Mặc định lọc `status = PENDING` (tab trên bảng: `Đang chờ` / `Đang xử lý` / `Đã xử lý` / `Tất cả`).
   - Cột **Thao tác**: nút **Chấp nhận** (nền cam `#F26F21`) và **Từ chối** (viền đỏ, chữ đỏ). Chỉ hiện với request `PENDING`.
   - Bấm → mở `RequestActionModal`.

### 6.3 Modal Chấp nhận / Từ chối — `src/components/advisor/RequestActionModal.tsx`

- Dùng `src/components/ui/Modal.tsx` (pattern giống `src/components/appointments/AppointmentActionModal.tsx`).
- Nội dung: thông tin student (tên, mã), loại yêu cầu, tiêu đề, mô tả đầy đủ, thời gian gửi.
- 2 chế độ:
  - **Chấp nhận**: textarea "Ghi chú cho sinh viên" (không bắt buộc) → `status = 'RESOLVED'`.
  - **Từ chối**: textarea "Lý do từ chối" (**bắt buộc**, validate khi blur/submit, báo lỗi inline) → `status = 'CANCELLED'`.
- Nút hủy / quay lại ở giữa. Nút submit disable khi đang pending.
- `onSuccess` → đóng modal; mutation tự invalidate list + toast.

### 6.4 Trang "Yêu cầu tư vấn" — `src/pages/advisor/AdvisorAdvisingRequests.tsx` (mới)

Trang full-table cho danh sách request (dùng lại `RequestListTable` + `RequestActionModal`), có ô tìm kiếm theo tên SV / tiêu đề.

---

## 7. Routing — `src/routes/index.tsx`

Thay `DashboardLayout` bằng layout riêng cho từng vai trò, **giữ nguyên `ProtectedRoute`** (đang ở DEV MODE, đừng xoá comment):

```tsx
{
  element: <ProtectedRoute allowedRoles={['STUDENT']} />,
  children: [
    {
      element: <StudentLayout />,
      children: [
        { path: '/student', element: <StudentPortal /> },
        { path: '/student/advising-requests', element: <AdvisingRequests /> },
        { path: '/student/appointments', element: <BookAppointment /> },
      ],
    },
  ],
},
{
  element: <ProtectedRoute allowedRoles={['ADVISOR']} />,
  children: [
    {
      element: <AdvisorLayout />,
      children: [
        { path: '/advisor', element: <AdvisorPortal /> },
        { path: '/advisor/advising-requests', element: <AdvisorAdvisingRequests /> },
        { path: '/advisor/appointments', element: <AdvisorAppointments /> },
      ],
    },
  ],
},
```

- Import `StudentLayout` từ `src/components/layout/student/StudentLayout`, `AdvisorLayout` từ `src/components/layout/advisor/AdvisorLayout`.
- Tên file page: `src/pages/student/AdvisingRequests.tsx` (export default `AdvisingRequests`) và `src/pages/advisor/AdvisorAdvisingRequests.tsx` (export default `AdvisorAdvisingRequests`) — tránh trùng tên giữa 2 thư mục khi import cùng lúc.
- `DashboardLayout.tsx` không còn dùng → xoá file (grep trước khi xoá: hiện chỉ `src/routes/index.tsx` import nó).

---

## 8. Hợp đồng API cần backend tuân theo

| Method | Path | Ai gọi | Query / Body | Trả về |
| --- | --- | --- | --- | --- |
| GET | `/student/profile` | Student | — | `StudentProfile` |
| GET | `/student/advisor` | Student | — | `AdvisorInfo \| null` |
| GET | `/student/notifications` | Student | `page, size, unreadOnly` | `Page<StudentNotification>` |
| PATCH | `/student/notifications/{id}/read` | Student | — | `{ updated: boolean }` |
| PATCH | `/student/notifications/read-all` | Student | — | `{ updated: number }` |
| GET | `/student/advising-requests` | Student | — | `AdvisingRequest[]` |
| POST | `/student/advising-requests` | Student | `{ requestType, title, description?, studyPlanId? }` | `AdvisingRequest` |
| GET | `/advisor/students` | Advisor | `search, page, size` | `Page<AdviseeStudent>` |
| GET | `/advisor/advising-requests` | Advisor | `status, search, page, size` | `Page<AdvisingRequest>` |
| PUT | `/advisor/advising-requests/{id}/status` | Advisor | `{ status, resolutionSummary? }` | `AdvisingRequest` |

**Side-effect backend cần làm (để 2 portal đồng bộ):**

1. Student tạo request → insert `notifications` cho **cố vấn**:
   `recipient_user_id = advisor.user_id`, `notification_type = 'ADVISOR_REQUEST'`, `related_student_id = student_id`, `action_url = '/advisor/advising-requests'`, `title = 'Yêu cầu tư vấn mới'`.
2. Advisor Chấp nhận/Từ chối → insert `notifications` cho **sinh viên**:
   `notification_type = 'MESSAGE'`, `action_url = '/student/advising-requests'`, `title = 'Yêu cầu tư vấn đã được xử lý'`.
3. `advising_requests.advisor_id` được set = advisor hiện tại khi advisor nhận request (`IN_PROGRESS`) hoặc xử lý.
4. Mọi thay đổi trạng thái nên ghi `audit_logs` (`entity_type = 'advising_request'`, `entity_id = request.id`, `old_values` / `new_values`).

---

## 9. Ngoài phạm vi (không làm lần này)

- Chat/nhắn tin trong request (`advising_messages`) — chỉ chừa cấu trúc type.
- Đặt lịch hẹn (`advising_sessions`, `advisor_availability`) — đã có ở task trước.
- AI chat / RAG / study plan cho sinh viên.
- Quản trị phía admin cho advising.

---

## 10. Definition of Done

- [ ] `npx tsc --noEmit` pass, không lỗi type.
- [ ] `npx vite build` chạy được.
- [ ] Bật mock (`VITE_MOCK_PORTAL` mặc định bật) thì cả 2 portal hiển thị dữ liệu đầy đủ, không lỗi console.
- [ ] Tắt mock thì service gọi đúng API thật (endpoint sai → lỗi 404 được hiển thị qua `apiErrorMessage`, không crash trắng màn hình).
- [ ] Sinh viên: xem cố vấn phụ trách, xem thông báo (đọc/không đọc, đánh dấu tất cả đã đọc), gửi yêu cầu tư vấn (validate đủ, sau khi gửi request mới xuất hiện trong danh sách).
- [ ] Cố vấn: xem danh sách SV được phân công (tìm kiếm + phân trang), xem danh sách request chờ duyệt, bấm **Chấp nhận** → request chuyển `RESOLVED`; bấm **Từ chối** → bắt buộc nhập lý do → request chuyển `CANCELLED`. Trạng thái cập nhật ngay trên bảng.
- [ ] Layout responsive: sidebar ẩn và hiện menu overlay ở màn hình nhỏ (`lg`), header co giãn.
- [ ] Mọi request ghi đều có CSRF header; mọi lỗi đều có toast + thông báo inline.
- [ ] Không dùng `any`, không hard-code URL tuyệt đối, không tạo status ngoài enum trong `.md`.
