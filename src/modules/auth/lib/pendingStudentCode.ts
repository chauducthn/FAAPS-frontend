// The Student ID typed on the registration page is carried over to the "choose your curriculum" step.
// Storage can be blocked (private mode), so every access is guarded and the step simply asks again.

const KEY = 'faaps.pendingStudentCode';

export const savePendingStudentCode = (code: string) => {
  try {
    sessionStorage.setItem(KEY, code);
  } catch {
    /* ignore: the next step asks for the Student ID again */
  }
};

export const readPendingStudentCode = (): string => {
  try {
    return sessionStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};

export const clearPendingStudentCode = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
