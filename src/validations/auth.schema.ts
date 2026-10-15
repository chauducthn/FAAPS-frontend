import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().refine(
    (value) => value.toLowerCase() === 'admin' || z.email().safeParse(value).success,
    'Enter admin or a valid email address',
  ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
