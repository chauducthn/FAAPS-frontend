// src/components/advisor/RequestActionModal.tsx
// Modal cố vấn Chấp nhận / Từ chối một yêu cầu tư vấn.
//
// Mapping trạng thái (DB không có ACCEPTED/REJECTED):
//   Chấp nhận → status = 'RESOLVED'
//   Từ chối   → status = 'CANCELLED'  (bắt buộc có resolutionSummary)

import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { RequestTypeLabel } from '../advising/RequestTypeLabel';
import { useUpdateAdvisingRequestStatus } from '../../hooks/mutations/useAdvisingMutations';
import type { AdvisingRequest } from '../../types/advising';

type Decision = 'accept' | 'reject';

interface Props {
  request: AdvisingRequest | null;
  decision: Decision;
  onClose: () => void;
}

const MAX_NOTE = 1000;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function RequestActionModal({ request, decision, onClose }: Props) {
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const updateMutation = useUpdateAdvisingRequestStatus();

  useEffect(() => {
    setNote('');
    setTouched(false);
  }, [request, decision]);

  if (!request) return null;

  const isReject = decision === 'reject';
  const noteMissing = isReject && touched && note.trim().length === 0;

  const handleSubmit = async () => {
    setTouched(true);
    if (isReject && note.trim().length === 0) return;

    try {
      await updateMutation.mutateAsync({
        id: request.id,
        body: {
          status: isReject ? 'CANCELLED' : 'RESOLVED',
          resolutionSummary: note.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Lỗi hiển thị bởi mutation / global handler; giữ modal mở để sửa.
    }
  };

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={isReject ? 'Từ chối yêu cầu' : 'Chấp nhận yêu cầu'}
      className="max-w-xl"
    >
      <div className="flex flex-col">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
              <RequestTypeLabel requestType={request.requestType} />
            </p>
            <h2 className="mt-0.5 text-base font-bold text-gray-900">{request.title}</h2>
          </div>

          <dl className="grid gap-2 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-bold uppercase text-gray-500">Sinh viên</dt>
              <dd className="font-semibold text-gray-900">
                {request.studentName}
                {request.studentCode ? ` · ${request.studentCode}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-gray-500">Thời gian gửi</dt>
              <dd className="text-gray-700">{formatDateTime(request.createdAt)}</dd>
            </div>
          </dl>

          {request.description && (
            <div>
              <p className="text-[11px] font-bold uppercase text-gray-500">Mô tả</p>
              <p className="mt-0.5 whitespace-pre-wrap rounded-lg bg-[#f7f8fa] px-3 py-2 text-[13px] leading-relaxed text-gray-700">
                {request.description}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          <label className="mb-1 block text-[11px] font-bold uppercase text-gray-600">
            {isReject ? 'Lý do từ chối' : 'Ghi chú cho sinh viên'}
            {isReject && <span className="text-red-500"> *</span>}
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={MAX_NOTE}
            placeholder={
              isReject
                ? 'Nêu rõ lý do để sinh viên có thể điều chỉnh...'
                : 'Ghi chú gợi ý cho sinh viên (không bắt buộc)...'
            }
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21]"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-[11px] ${noteMissing ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
              {noteMissing ? 'Cần nhập lý do từ chối.' : ''}
            </p>
            <p className="text-[11px] text-gray-400">
              {note.length}/{MAX_NOTE}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className={
              isReject
                ? 'rounded-lg border border-red-300 bg-white px-4 py-2 font-bold text-red-600 hover:bg-red-50 disabled:opacity-60'
                : 'rounded-lg bg-[#F26F21] px-4 py-2 font-bold text-white hover:bg-[#e05f14] disabled:opacity-60'
            }
          >
            {updateMutation.isPending
              ? 'Đang lưu...'
              : isReject
                ? 'Xác nhận từ chối'
                : 'Xác nhận chấp nhận'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
