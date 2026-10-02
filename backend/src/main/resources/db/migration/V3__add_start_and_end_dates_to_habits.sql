-- Migration: Add start_date and end_date to habits table
-- Description: Supports habit active date ranges, expiration, and scheduling

ALTER TABLE habits ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS end_date DATE;
