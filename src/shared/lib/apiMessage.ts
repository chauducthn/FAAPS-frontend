import axios from 'axios';

export function apiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string } | undefined;
    return data?.message ?? data?.detail ?? (error.response?.status ? `Request failed (${error.response.status})` : 'Cannot reach the server.');
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
