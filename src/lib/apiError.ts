import axios from 'axios';

/** Best-effort readable message from a failed API call (backend sends `{ "error": "..." }`). */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
