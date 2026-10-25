// src/mocks/index.ts
// Bật/tắt fake data cho từng khu vực của ứng dụng.
//
// - Mặc định BẬT: dùng dữ liệu giả để xem/thử UI khi backend chưa sẵn sàng.
// - Tắt: đặt VITE_MOCK_AI=false / VITE_MOCK_PORTAL=false trong .env,
//   hoặc bấm nút "Demo data" trên thanh header của các trang tương ứng.
// - Trạng thái được lưu ở localStorage nên không cần khởi động lại Vite.

import { useSyncExternalStore } from 'react';

/** Một nhóm fake data độc lập: AI (khu vực quản trị) và Portal (sinh viên / cố vấn). */
export type MockScope = 'ai' | 'portal';

interface ScopeConfig {
  /** Tên biến môi trường Vite, vd 'VITE_MOCK_AI'. */
  envKey: string;
  /** Key lưu trạng thái trong localStorage. */
  storageKey: string;
}

const SCOPES: Record<MockScope, ScopeConfig> = {
  ai: { envKey: 'VITE_MOCK_AI', storageKey: 'faaps.mock-ai' },
  portal: { envKey: 'VITE_MOCK_PORTAL', storageKey: 'faaps.mock-portal' },
};

const readEnvDefault = (envKey: string) => {
  const raw = import.meta.env[envKey] as string | undefined;
  if (raw === undefined || raw === '') return true;
  return raw !== 'false' && raw !== '0';
};

const readStored = (config: ScopeConfig): boolean => {
  if (typeof window === 'undefined') return readEnvDefault(config.envKey);
  const stored = window.localStorage.getItem(config.storageKey);
  if (stored === null) return readEnvDefault(config.envKey);
  return stored === 'true';
};

const listeners = new Set<() => void>();

/** Bật/tắt một scope và thông báo các component đang theo dõi. */
const setScopeEnabled = (scope: MockScope, enabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SCOPES[scope].storageKey, String(enabled));
  listeners.forEach((l) => l());
};

const getScopeEnabled = (scope: MockScope): boolean => readStored(SCOPES[scope]);

const toggleScope = (scope: MockScope) => setScopeEnabled(scope, !getScopeEnabled(scope));

/** Hook để UI phản ánh trạng thái mock của một scope (re-render khi bật/tắt). */
const useScope = (scope: MockScope) =>
  useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => getScopeEnabled(scope),
  );

// ---- scope AI (khu vực quản trị AI: Config / Performance / Reports)

export const isMockAiEnabled = () => getScopeEnabled('ai');
export const setMockAiEnabled = (enabled: boolean) => setScopeEnabled('ai', enabled);
export const toggleMockAi = () => toggleScope('ai');
export const useMockAi = () => useScope('ai');

// ---- scope Portal (Student Portal / Advisor Portal)

export const isMockPortalEnabled = () => getScopeEnabled('portal');
export const setMockPortalEnabled = (enabled: boolean) => setScopeEnabled('portal', enabled);
export const toggleMockPortal = () => toggleScope('portal');
export const useMockPortal = () => useScope('portal');

if (typeof window !== 'undefined') {
  // Đồng bộ lại khi một tab khác đổi trạng thái.
  window.addEventListener('storage', () => listeners.forEach((l) => l()));
}
