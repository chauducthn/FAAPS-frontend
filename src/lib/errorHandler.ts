// src/lib/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ApiErrorResponse } from '../types/api';

export const handleApiError = (error: unknown) => {
  if (import.meta.env.DEV) console.error('[API Error]:', error);

  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;
    const requestUrl = axiosError.config?.url;

    if (status === 401 && requestUrl?.startsWith('/auth/')) {
      return;
    }

    if (status === 400) {
      return errorData;
    }

    // Spring endpoints reply with { error }, the shared contract uses { message }.
    const serverMessage = errorData?.message ?? (errorData as { error?: string } | undefined)?.error;
    if (serverMessage) {
      toast.error(serverMessage);
      return errorData;
    }

    switch (status) {
      case 401:
        toast.error('Your session has expired. Please sign in again.');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('You do not have permission to do this.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 500:
        toast.error('Server error (500). Please try again later.');
        break;
      default:
        toast.error('Cannot reach the server. Please check your connection.');
    }
    return;
  }

  toast.error('An unexpected error occurred.');
};
