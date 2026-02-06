-- Migration: Add photo_url to teams table
-- Date: 2026-02-05

ALTER TABLE teams ADD COLUMN IF NOT EXISTS photo_url TEXT;

COMMENT ON COLUMN teams.photo_url IS 'URL to team photo (uploaded by admin)';
