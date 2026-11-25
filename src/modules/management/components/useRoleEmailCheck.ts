// Debounced email-uniqueness hooks for single and bulk role-change modals.
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { adminService } from '../services/adminService';

export function useSingleEmailAvailability(
  open: boolean,
  userId: string | undefined,
  email: string,
  enabled: boolean,
) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const debounced = useDebounce(email, 300);

  useEffect(() => {
    if (!open || !userId || !enabled || !debounced.includes('@')) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    let active = true;
    setChecking(true);
    adminService
      .checkEmailAvailability([{ userId, email: debounced }])
      .then((res) => {
        if (active) setAvailable(res[debounced] ?? true);
      })
      .catch(() => {
        if (active) setAvailable(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [open, userId, debounced, enabled]);

  return { available, checking };
}

export function useBulkEmailAvailability(
  open: boolean,
  entries: Array<{ userId: string; email: string }>,
) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);

  const signature = useMemo(
    () => entries.map((e) => `${e.userId}:${e.email.trim().toLowerCase()}`).join('|'),
    [entries],
  );
  const debouncedSignature = useDebounce(signature, 300);

  useEffect(() => {
    if (!open || entries.length === 0) {
      setAvailability({});
      setChecking(false);
      return;
    }
    const toCheck = entries
      .map((e) => ({ userId: e.userId, email: e.email.trim().toLowerCase() }))
      .filter((e) => e.email.includes('@'));
    if (toCheck.length === 0) return;
    let active = true;
    setChecking(true);
    adminService
      .checkEmailAvailability(toCheck)
      .then((res) => {
        if (active) setAvailability(res);
      })
      .catch(() => {
        if (active) setAvailability({});
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSignature]);

  return { availability, checking };
}
