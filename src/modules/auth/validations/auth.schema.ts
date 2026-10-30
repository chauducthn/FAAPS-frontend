import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().refine(
    (value) => value.toLowerCase() === 'admin' || z.email().safeParse(value).success,
    'Enter your email address (or admin)',
  ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
