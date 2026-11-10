import { z } from 'zod';

export const MAX_TASK_TITLE = 255;
export const MAX_TASK_DESCRIPTION = 10000;
export const MAX_TASK_URL = 1000;

const isValidLink = (value: string) => {
  if (!value) return true;
  try {
    const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;
    const parsed = new URL(candidate);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
};

const isValidDay = (value: string) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const learningTaskSchema = z.object({
  title: z.string().trim().min(1, 'Give the task a title').max(MAX_TASK_TITLE, 'Keep the title under 255 characters'),
  description: z
    .string()
    .max(MAX_TASK_DESCRIPTION, 'Keep the description under 10,000 characters')
    .optional()
    .or(z.literal('')),
  dueDate: z.string().refine(isValidDay, { message: 'Pick a valid deadline' }).optional().or(z.literal('')),
  resourceUrl: z
    .string()
    .trim()
    .max(MAX_TASK_URL, 'Keep the link under 1,000 characters')
    .refine(isValidLink, { message: 'Enter a valid link, e.g. https://example.com/notes' })
    .optional()
    .or(z.literal('')),
});

export type LearningTaskFormValues = z.infer<typeof learningTaskSchema>;
