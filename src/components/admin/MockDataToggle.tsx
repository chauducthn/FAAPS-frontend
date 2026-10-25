// src/components/admin/MockDataToggle.tsx
// Nút bật/tắt dữ liệu giả. Khi BẬT, các trang dùng scope đó đọc dữ liệu từ src/mocks/*
// nên không cần backend; khi TẮT, chúng gọi API thật.
//
// scope='ai'     → khu vực quản trị AI (src/mocks/ai.ts), biến môi trường VITE_MOCK_AI.
// scope='portal' → Student Portal / Advisor Portal (src/mocks/advising.ts), VITE_MOCK_PORTAL.

import { FlaskConical, Wifi } from 'lucide-react';
import {
  toggleMockAi,
  toggleMockPortal,
  useMockAi,
  useMockPortal,
  type MockScope,
} from '../../mocks';
import { cn } from '@/lib/utils';

export function MockDataToggle({
  className,
  scope = 'ai',
}: {
  className?: string;
  scope?: MockScope;
}) {
  // Gọi cả hai hook ở mọi lần render để không vi phạm rules of hooks,
  // rồi chọn giá trị theo scope.
  const aiEnabled = useMockAi();
  const portalEnabled = useMockPortal();
  const enabled = scope === 'portal' ? portalEnabled : aiEnabled;

  return (
    <button
      type="button"
      onClick={scope === 'portal' ? toggleMockPortal : toggleMockAi}
      aria-pressed={enabled}
      title={
        enabled
          ? 'Đang dùng dữ liệu giả. Bấm để chuyển sang API thật.'
          : 'Đang dùng API thật. Bấm để chuyển sang dữ liệu giả.'
      }
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors',
        enabled
          ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border-[#e5e7eb] bg-white text-[#555f6f] hover:bg-gray-50',
        className,
      )}
    >
      {enabled ? <FlaskConical className="size-3.5" /> : <Wifi className="size-3.5" />}
      {enabled ? 'Demo data' : 'Live API'}
    </button>
  );
}

/** Banner hiển thị ở đầu trang khi đang chạy với dữ liệu giả. */
export function MockDataBanner({ className, scope = 'ai' }: { className?: string; scope?: MockScope }) {
  const aiEnabled = useMockAi();
  const portalEnabled = useMockPortal();
  const enabled = scope === 'portal' ? portalEnabled : aiEnabled;
  if (!enabled) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-800',
        className,
      )}
    >
      <FlaskConical className="size-4 shrink-0" />
      <span className="font-semibold">Đang hiển thị dữ liệu giả (demo).</span>
      <span className="text-amber-700">Các thao tác lưu/xóa chỉ có tác dụng trong phiên trình duyệt này.</span>
    </div>
  );
}
