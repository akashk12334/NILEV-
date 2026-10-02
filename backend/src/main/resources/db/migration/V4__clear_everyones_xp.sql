-- Migration: Clear everyone's XP and reset level to 1
-- Description: Resets all user XP, companion XP, and companion history XP gains to zero.

UPDATE users SET xp = 0, level = 1, companion_level = 1 WHERE xp > 0 OR level > 1;
UPDATE companions SET xp = 0, level = 1 WHERE xp > 0 OR level > 1;
UPDATE companion_history SET xp_gained = 0 WHERE xp_gained > 0;
