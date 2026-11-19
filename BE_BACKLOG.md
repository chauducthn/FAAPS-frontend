# BE Backlog — các hạng mục FE cần nhưng BE chưa có API

Danh sách này ghi lại những mục FE đã ẩn/tạm dừng vì backend chưa sẵn sàng.
Khi BE triển khai xong endpoint tương ứng, bỏ comment trong code FE và bỏ mục tương ứng ở đây.

---

## Advisor — Academic Search (tạm ẩn trong sidebar)

**Trạng thái:** BE chưa có endpoint — FE đã comment-out mục menu "Academic Search"
(`src/shared/components/layout/advising/AdvisorSidebar.tsx`).

**Lý do:** các endpoint dưới đây chưa tồn tại trên BE; gọi vào sẽ trả 404.
Phần code FE đã chuẩn bị sẵn tại:

- `src/modules/advising/services/academicLookupService.ts`
- `src/modules/advising/pages/AdvisorAcademicLookup.tsx` (route `/advisor/academic-lookup`)

**Endpoint cần BE cung cấp** (role `ADVISOR`, chỉ đọc):

| Method | Path | Query/Body | Response |
| --- | --- | --- | --- |
| GET | `/advisor/academic/courses` | `search`, `category` | `LookupCourse[]` — course gồm `prerequisites`; `syllabus` có thể rỗng |
| GET | `/advisor/academic/courses/{id}` | — | `LookupCourse` — chi tiết + `prerequisites` đầy đủ |
| GET | `/advisor/academic/curriculums` | — | `LookupCurriculum[]` — kèm `semesters[].courses` = mã môn học |

**Việc cần làm khi BE xong:**
1. Bỏ comment dòng `items: [{ label: 'Academic Search', to: '/advisor/academic-lookup', icon: BookOpen }]`
   trong `AdvisorSidebar.tsx` (và bỏ comment import `BookOpen`).
2. Cập nhật lại `AdvisorSidebar.test.tsx` để kỳ vọng link `Academic Search` xuất hiện trở lại.
3. Xoá mục này khỏi `BE_BACKLOG.md`.

---

## Advisor — Study Plan Reviews (`status=ALL`)

**Trạng thái:** BE chỉ hỗ trợ `GET /advisor/study-plans?status=` với các giá trị
`SUBMITTED`, `APPROVED`, `NEEDS_REVISION`. Không có `ALL` (và không có `REJECTED`)
nên FE không thể lấy một danh sách tổng hợp.

**Cách FE hiện tại xử lý:** dùng 3 query riêng (`SUBMITTED`, `APPROVED`, `NEEDS_REVISION`)
với `size=1` để lấy `totalElements` và cộng lại cho KPI.

**Endpoint cần BE cung cấp (không bắt buộc, để tối ưu):**

| Method | Path | Query | Response |
| --- | --- | --- | --- |
| GET | `/advisor/study-plans/counts` | — | `{ submitted: number, approved: number, needsRevision: number, total: number }` |

**Việc cần làm khi BE xong:** thay 3 query đếm bằng 1 query `/advisor/study-plans/counts`
trong `src/modules/advising/pages/AdvisorStudyPlans.tsx`.

---

## Advisor — Advising Request: trạng thái "từ chối"

**Trạng thái:** DB chỉ có `PENDING | IN_PROGRESS | RESOLVED | CANCELLED` — không có
`REJECTED`. BE yêu cầu `resolutionSummary` non-blank cho mọi lần chuyển trạng thái.

**Cách FE hiện tại xử lý:**
- Accept → `status: 'RESOLVED'` + `resolutionSummary` (bắt buộc nhập).
- Reject → `status: 'IN_PROGRESS'` + `resolutionSummary` (bắt buộc nhập).

**Đề xuất cho BE:** bổ sung trạng thái `REJECTED` (hoặc trường `rejection_reason` riêng)
để phân biệt "đang xử lý" với "đã từ chối" — hiện tại FE phải dùng `IN_PROGRESS` cho cả hai.

---

## Advisor — Appointment: hủy lịch

**Trạng thái:** đã có endpoint `PUT /appointments/{id}/cancel` (body `{ reason }`) nên
FE dùng endpoint này cho nút "Hủy lịch", không dùng
`PUT /advisor/appointments/{id}/status` với `status: 'CANCELLED'`.

**Ghi chú BE:** endpoint `/advisor/appointments/{id}/status` vẫn nhận `CANCELLED` —
FE không dùng nhưng BE có thể giữ hoặc bỏ. Nếu bỏ, cần đảm bảo
`PUT /appointments/{id}/cancel` cho phép advisor hủy lịch của sinh viên
(cần phân quyền advisor + kiểm tra lịch còn `ACCEPTED`).
## Enum cần mở rộng (P0)
### RequestStatus thiếu REJECTED
- Hiện trạng: Reject dùng `IN_PROGRESS` + `resolutionSummary`. Không phân biệt được với "đang xử lý" thật.
- Đề xuất BE: thêm enum `REJECTED`. FE sẽ đổi mapping 1 dòng trong `useAdvisingMutations.ts`.
- Workaround tạm: filter theo `status=IN_PROGRESS AND resolutionSummary IS NOT NULL` → coi là "đã từ chối".

---

## Blocker (P0)

### Advisor — Students At Risk (widget "Sinh viên có nguy cơ")

**Trạng thái:** BE **chưa có** endpoint. FE đã viết đầy đủ service + hook + component
và mount vào Advisor Dashboard, nhưng widget sẽ hiển thị trạng thái lỗi cho tới khi
BE triển khai endpoint dưới đây.

**Method + Endpoint:**

```
GET /advisor/at-risk-students
```

**Query params:** (không có — endpoint hiện trả về toàn bộ danh sách SV của advisor)

**Payload / Response shape:**

```jsonc
{
  "data": [
    {
      "id": "uuid",              // students.user_id — dùng mở Student 360 Modal
      "studentCode": "SE123456", // MSSV
      "fullName": "Nguyễn Văn A",// users.full_name (nullable)
      "majorCode": "SE",         // majors.code (nullable)
      "majorName": "Software Engineering", // majors.name (nullable)
      "currentSemester": 7,     // students.current_semester (nullable)
      "currentGpa": 4.2,        // students.current_gpa — thang 10.00 (nullable)
      "riskLevel": "HIGH",      // HIGH | MEDIUM | LOW
      "reasons": ["LOW_GPA", "HIGH_ABSENCE"], // LOW_GPA | HIGH_ABSENCE | FAILED_COURSES
      "reasonDetails": "GPA 4.20 < 5.00",     // nullable — mô tả chi tiết
      "totalCreditsEarned": 96,  // students.total_credits_earned
      "detectedAt": "2026-11-19T00:00:00Z"    // ISO-8601, nullable
    }
  ],
  "total": 7
}
```

**Enum cần BE thống nhất:**

| Enum | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `riskLevel` | `HIGH` \| `MEDIUM` \| `LOW` | Mức độ nguy cơ do BE chấm |
| `reasons[]` | `LOW_GPA` \| `HIGH_ABSENCE` \| `FAILED_COURSES` | GPA thấp / vắng nhiều / nợ môn |

**File FE đang chờ endpoint này:**

- `src/modules/advising/services/advisorAtRiskApi.ts` — service gọi API (có `// TODO(BE): implement GET /advisor/at-risk-students`)
- `src/modules/advising/types/at-risk.ts` — type `RiskLevel`, `RiskReason`, `AtRiskStudent`, `AtRiskStudentResponse`
- `src/modules/advising/hooks/queries/useAtRiskStudents.ts` — hook `useAtRiskStudents` (query key `['advisor','at-risk-students']`)
- `src/modules/advising/components/AtRiskStudentsWidget.tsx` — widget UI
- `src/modules/advising/pages/AdvisorPortal.tsx` — mount widget dưới KPI + mở `Student360Modal`

**Priority:** P0 — chặn Flow 3 (Passive warning).

---

## Gap phát sinh thêm (P1 / P2)

### P1 — Lọc / phân trang / sắp xếp danh sách at-risk

Widget hiện render toàn bộ `data` trả về, không có phân trang. Khi BE có thêm người dùng,
danh sách sẽ dài và không scroll được trên mobile.

| Method | Path | Query | Response | File FE đang chờ |
| --- | --- | --- | --- | --- |
| GET | `/advisor/at-risk-students` | `riskLevel` (`HIGH`\|`MEDIUM`\|`LOW`), `reason` (`LOW_GPA`\|`HIGH_ABSENCE`\|`FAILED_COURSES`), `page`, `size` | `{ data: AtRiskStudent[]; total: number; page: number; size: number; totalPages: number }` | `src/modules/advising/services/advisorAtRiskApi.ts` |

**Priority:** P1 — không chặn MVP nhưng cần trước khi dữ liệu thực.

### P1 — Đếm theo mức độ nguy cơ (cho KPI cards)

Dashboard cần đếm nhanh số SV theo từng mức độ mà không tải cả danh sách.

| Method | Path | Query | Response | File FE đang chờ |
| --- | --- | --- | --- | --- |
| GET | `/advisor/at-risk-students/counts` | — | `{ high: number; medium: number; low: number; total: number }` | `src/modules/advising/components/AtRiskStudentsWidget.tsx` |

**Priority:** P1 — hiện badge đếm dùng `total` từ response chính.

### P2 — Ghi nhận / đóng cảnh báo học vụ

Advisor cần đánh dấu đã xử lý một cảnh báo để nó không hiện lại ở kỳ sau.

| Method | Path | Payload | Response | File FE đang chờ |
| --- | --- | --- | --- | --- |
| POST | `/advisor/at-risk-students/{studentId}/acknowledge` | `{ note?: string }` | `AtRiskStudent` | (chưa có — widget chỉ read-only) |

**Priority:** P2 — ngoài phạm vi Flow 3 hiện tại.
