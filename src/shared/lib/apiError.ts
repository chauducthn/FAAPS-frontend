import axios from 'axios';
import { toast } from 'sonner';

interface ErrorBody {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/** Best-effort readable message from a failed API call (backend sends `{ "error": "..." }`). */
export const apiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorBody | undefined;
    const fields = data?.fieldErrors ? Object.values(data.fieldErrors).filter(Boolean) : [];
    // "Validation failed" alone says nothing; the field messages do.
    if (fields.length > 0 && (!data?.message || data.message === 'Validation failed')) return fields.join(' ');
    return data?.error ?? data?.message ?? fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/**
 * The global error handler stays silent on 400 (forms are expected to show field errors). For actions without
 * a form, such as adding a relation, use this as the mutation's onError so the user still learns what was wrong.
 */
export const toastBadRequest = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    toast.error(apiErrorMessage(error));
  }
};
