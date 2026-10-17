// src/lib/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ApiErrorResponse } from '../types/api';

const SUPPRESSED_PATHS = ['/auth/me', '/auth/csrf'];

// Cooldown so the same error doesn't spam as a stack of identical toasts
// when several requests fail back-to-back (e.g. parallel queries on a 5xx).
const RECENT_TOAST = new Map<string, number>();
const TOAST_COOLDOWN_MS = 1500;

const isSuppressed = (url?: string) =>
  !!url && SUPPRESSED_PATHS.some((p) => url.includes(p));

const showError = (id: string, message: string) => {
  const now = Date.now();
  const last = RECENT_TOAST.get(id) ?? 0;
  if (now - last < TOAST_COOLDOWN_MS) return;
  RECENT_TOAST.set(id, now);
  toast.error(message, { id });
};

export const handleApiError = (error: unknown) => {
  if (import.meta.env.DEV) console.error('[API Error]:', error);

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;
    const requestUrl = axiosError.config?.url;

    // Silent auth bootstrap: when the app boots and there's no session yet,
    // /auth/me returns 401. That is expected - never surface it as a toast.
    if (isSuppressed(requestUrl)) {
      return errorData;
    }

    if (status === 401 && requestUrl?.startsWith('/auth/')) {
      return;
    }

    if (status === 400) {
      return errorData;
    }

    // Spring endpoints reply with { error }, the shared contract uses { message }.
    const serverMessage = errorData?.message ?? (errorData as { error?: string } | undefined)?.error;
    if (serverMessage) {
      showError(`server:${serverMessage}`, serverMessage);
      return errorData;
    }

    switch (status) {
      case 401:
        showError('auth:401', 'Your session has expired. Please sign in again.');
        window.location.href = '/login';
        break;
      case 403:
        showError('auth:403', 'You do not have permission to do this.');
        break;
      case 404:
        showError('http:404', 'Resource not found.');
        break;
      case 500:
        showError('http:500', 'Server error (500). Please try again later.');
        break;
      default:
        showError('http:network', 'Cannot reach the server. Please check your connection.');
    }
    return;
  }

  showError('http:unknown', 'An unexpected error occurred.');
};
