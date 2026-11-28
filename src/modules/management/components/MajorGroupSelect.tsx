// Dropdown of Major Groups for Admin forms (Advisor accounts, Majors). Options come from GET /api/major-groups.
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { useMajorGroups } from '../../academic/hooks/queries/useMajorGroups';

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  /** Load the list only while the form is open. */
  enabled?: boolean;
};

export const MajorGroupSelect = forwardRef<HTMLSelectElement, Props>(function MajorGroupSelect(
  { enabled = true, disabled, ...props },
  ref,
) {
  const groups = useMajorGroups(enabled);
  const placeholder = groups.isLoading
    ? 'Loading major groups…'
    : groups.isError
      ? 'Major groups could not be loaded'
      : 'Select a major group…';

  return (
    <select ref={ref} disabled={disabled || groups.isLoading || groups.isError} {...props}>
      <option value="">{placeholder}</option>
      {(groups.data ?? []).map((g) => (
        <option key={g.id} value={g.id}>
          {g.code} · {g.name}
        </option>
      ))}
    </select>
  );
});
