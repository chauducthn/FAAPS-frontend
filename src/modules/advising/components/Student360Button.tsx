// src/modules/advising/components/Student360Button.tsx
// Nút "View Student Profile" (Xem hồ sơ sinh viên 360) dùng chung.
//
// Bấm vào ⇒ gọi `GET /advisor/students/{studentId}` rồi mở `Student360Modal`.
// Dùng chung cho cả 2 nơi cần xem hồ sơ:
//   • AdvisorRequestDetailModal (ticket detail)
//   • AppointmentActionModal (chi tiết lịch hẹn)

import { useState } from 'react';
import { User as UserRound } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { apiMessage } from '../../../shared/lib/apiMessage';
import { cn } from '@/shared/lib/utils';
import { advisorService, type AdvisorStudentDetail } from '../services/advisorService';
import { Student360Modal } from './Student360Modal';

interface Student360ButtonProps {
  /** students.user_id — null ⇒ nút bị vô hiệu hoá. */
  studentId: string | null | undefined;
  /** Tên sinh viên (hiển thị phụ nếu muốn). */
  studentName?: string | null;
  /** Nhãn của nút. */
  label?: string;
  /** Class cho nút — cho phép mỗi nơi tự style. */
  className?: string;
}

export function Student360Button({
  studentId,
  studentName,
  label = 'View Student Profile',
  className,
}: Student360ButtonProps) {
  const [detail, setDetail] = useState<AdvisorStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const open = async () => {
    if (!studentId || loading) return;
    setLoading(true);
    try {
      const result = await advisorService.getStudentDetail(studentId);
      setDetail(result);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={!studentId || loading}
        title={studentName ? `View ${studentName}'s 360 profile` : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[#F26F21]/40 hover:text-[#F26F21] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <UserRound className="size-4" aria-hidden />
        {loading ? 'Loading…' : label}
      </button>

      <Student360Modal detail={detail} onClose={() => setDetail(null)} />
    </>
  );
}
