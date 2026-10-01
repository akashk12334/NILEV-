export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
  active: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  // Optional convenience alias for compatibility
  firstName?: string;
  lastName?: string;
}
