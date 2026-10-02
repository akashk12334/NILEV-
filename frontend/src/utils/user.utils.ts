/**
 * Returns the effective display name for a user.
 * In NILEV, if a user has configured a nickname, it acts as their primary display name
 * across greetings, dashboard, habits, partner interactions, and achievements.
 * Falls back to full name or 'Friend'.
 */
export function getUserDisplayName(
  user?: {
    nickname?: string | null;
    name?: string | null;
    firstName?: string | null;
  } | null
): string {
  if (!user) return "Friend";
  if (user.nickname && user.nickname.trim().length > 0) {
    return user.nickname.trim();
  }
  if (user.name && user.name.trim().length > 0) {
    return user.name.trim();
  }
  if (user.firstName && user.firstName.trim().length > 0) {
    return user.firstName.trim();
  }
  return "Friend";
}
