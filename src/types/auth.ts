export type RoleCode = 'ADMIN' | 'ADVISOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  status: UserStatus;
  avatarUrl?: string | null;
}