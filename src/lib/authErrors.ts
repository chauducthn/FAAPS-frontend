import axios from 'axios';
import type { ApiErrorResponse } from '../types/api';

export interface LoginNotice {
  title: string;
  message: string;
  tone: 'error' | 'info';
}

/** Where the app sends a user whose session is gone; the Login page explains why. */
export const SESSION_EXPIRED_URL = '/login?error=session-expired';

/** Values of the `error` query parameter: set by the backend after Google sign-in, or by this app. */
const LOGIN_PARAM_NOTICES: Record<string, LoginNotice> = {
  'session-expired': {
    title: 'Your session has ended',
    message: 'For your security you were signed out. Please sign in again to continue.',
    tone: 'info',
  },
  'handover-complete': {
    title: 'Admin access handed over',
    message: 'The admin role now belongs to another account. Sign in with the new admin account.',
    tone: 'info',
  },
  'google-sign-in-failed': {
    title: 'Google sign-in did not finish',
    message: 'Google could not complete the sign-in, or it was cancelled. Please try again.',
    tone: 'error',
  },
  'google-email-unverified': {
    title: 'Google email not verified',
    message: 'Your Google account email is not verified. Verify it with Google, then sign in again.',
    tone: 'error',
  },
  'google-account-conflict': {
    title: 'Account conflict',
    message: 'This Google account is linked to a different FAAPS account. Contact an administrator to fix the link.',
    tone: 'error',
  },
  'account-disabled': {
    title: 'Account is not active',
    message: 'Your account is suspended or inactive. Contact an administrator to restore access.',
    tone: 'error',
  },
  'account-store-unavailable': {
    title: 'Sign-in is temporarily unavailable',
    message: 'The account service cannot be reached right now. Please try again in a few minutes.',
    tone: 'error',
  },
};

export const loginNoticeFromParam = (code: string | null): LoginNotice | null => {
  if (!code) return null;
  return (
    LOGIN_PARAM_NOTICES[code] ?? {
      title: 'Sign-in failed',
      message: 'Something went wrong while signing in. Please try again.',
      tone: 'error',
    }
  );
};

/** Turns a failed admin sign-in request into text the user can act on. */
export const adminLoginNotice = (error: unknown): LoginNotice => {
  const title = 'Could not sign in';
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return { title, message: 'Could not sign in. Please try again.', tone: 'error' };
  }
  if (!error.response) {
    return { title: 'Cannot reach the server', message: 'Check your connection and try again.', tone: 'error' };
  }
  const code = error.response.data?.code;
  const status = error.response.status;
  if (code === 'INVALID_CREDENTIALS' || status === 401) {
    return { title, message: 'Invalid username/email or password.', tone: 'error' };
  }
  if (code === 'ACCOUNT_INACTIVE') {
    return { title: 'Account is not active', message: 'This account is suspended or inactive. Contact an administrator.', tone: 'error' };
  }
  if (code === 'ACCOUNT_STORAGE_UNAVAILABLE' || status >= 500) {
    return { title: 'Sign-in is temporarily unavailable', message: 'The server could not process the request. Please try again shortly.', tone: 'error' };
  }
  if (status === 403) {
    return { title, message: 'The request was rejected. Reload the page and try again.', tone: 'error' };
  }
  return { title, message: error.response.data?.message ?? 'Could not sign in. Please try again.', tone: 'error' };
};
