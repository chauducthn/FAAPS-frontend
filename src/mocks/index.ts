// src/mocks/index.ts
// Bật/tắt fake data cho toàn bộ khu vực quản trị AI (Config / Performance / Reports).
//
// - Mặc định BẬT: dùng dữ liệu giả để xem/thử UI khi backend chưa sẵn sàng.
// - Tắt: đặt VITE_MOCK_AI=false trong .env, hoặc bấm nút "Demo data" trên thanh header của các trang AI.
// - Trạng thái được lưu ở localStorage nên không cần khởi động lại Vite.

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'faaps.mock-ai';

const readEnvDefault = () => {
  const raw = import.meta.env.VITE_MOCK_AI;
  if (raw === undefined || raw === '') return true;
  return raw !== 'false' && raw !== '0';
};

const readStored = (): boolean => {
  if (typeof window === 'undefined') return readEnvDefault();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) return readEnvDefault();
  return stored === 'true';
};

let current = readStored();

const listeners = new Set<() => void>();

const emit = () => {
  current = readStored();
  listeners.forEach((l) => l());
};

export const isMockAiEnabled = () => current;

export const setMockAiEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
  emit();
};

export const toggleMockAi = () => setMockAiEnabled(!current);

/** Hook để UI phản ánh trạng thái mock (re-render khi bật/tắt). */
export const useMockAi = () =>
  useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => current,
  );

if (typeof window !== 'undefined') {
  // Đồng bộ lại khi một tab khác đổi trạng thái.
  window.addEventListener('storage', emit);
}
