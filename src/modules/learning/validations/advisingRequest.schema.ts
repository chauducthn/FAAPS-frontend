import { z } from 'zod';

/** POST /api/student/advising-requests only takes a title and a description (both required by the backend). */
export const advisingRequestSchema = z.object({
  title: z.string().trim().min(5, 'Title must contain at least 5 characters').max(255, 'Maximum 255 characters'),
  description: z.string().trim().min(10, 'Describe your question in at least 10 characters').max(10000, 'Maximum 10000 characters'),
});

export type AdvisingRequestFormValues = z.infer<typeof advisingRequestSchema>;

export const replySchema = z.object({
  content: z.string().trim().min(1, 'Write a message first').max(10000, 'Maximum 10000 characters'),
});
