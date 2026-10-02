-- Migration: Add nickname and profile_image_url to users table
-- Description: Supports custom couple display name (nickname) and profile image URL storage

ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255);
