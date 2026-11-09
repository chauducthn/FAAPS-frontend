import { z } from 'zod';
import { phoneSchema } from '../../auth/validations/register.schema';

/** The two fields the backend lets a student change (PUT /api/student/profile). */
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(255, 'At most 255 characters'),
  phone: phoneSchema,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
