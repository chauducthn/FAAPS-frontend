import axios from 'axios';

export function apiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string } | undefined;
    return data?.message ?? data?.detail ?? (error.response?.status ? `Request failed (${error.response.status})` : 'Cannot reach the server.');
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

/**
 * The API message of an error, falling back to a caller-provided message when
 * the server did not send one.
 */
export function readApiMessage(error: unknown, fallback: string): string {
  const message = apiMessage(error);
  return message === 'An unexpected error occurred.' ? fallback : message;
}
