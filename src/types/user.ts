export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'INACTIVE';

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  /** Current password, required to confirm the user. */
  currentPassword: string;
  newPassword: string;
}

/** Preferred locale; the backend echoes this back so the
 *  next-handler can pick the right translation bundle. */
export type UserLocale = 'vi' | 'en';

export interface NotificationSettings {
  /** Toggle for 'you have cards due today' notifications. */
  reviewReminders: boolean;
  /** Toggle for 'your streak is about to expire' notifications. */
  streakReminders: boolean;
  /** Toggle for AI roleplay follow-ups. */
  roleplayReminders: boolean;
  /** Quiet hours in 24h 'HH:mm' format. When set, no notifications
   *  are delivered between these two times. */
  quietHoursStart?: string;
  quietHoursEnd?: string;
  /** Server-side push token, registered when the user grants
   *  permission. May be null when the user has not opted in. */
  pushToken?: string | null;
}

export interface UserStatsResponse {
  userId: string;
  totalCollections: number;
  totalVocabulary: number;
  totalReviews: number;
  totalQuizzes: number;
  totalTyping: number;
  totalRoleplay: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: string;
}