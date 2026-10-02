export interface User {
  id: number;
  name: string;
  email: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  profileImageUrl?: string | null;
  role?: string;
  active: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  // Optional convenience alias for compatibility
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserRequest {
  name?: string;
  nickname?: string;
  profileImageUrl?: string;
}

export interface DeleteAccountRequest {
  confirmation: string;
}

