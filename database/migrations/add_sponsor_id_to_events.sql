-- Migration: Add sponsor_id to events table
-- This allows events to reference their sponsor

ALTER TABLE events 
ADD COLUMN sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL;

COMMENT ON COLUMN events.sponsor_id IS 'Reference to the event sponsor for branding';

-- Create index for faster lookups
CREATE INDEX idx_events_sponsor_id ON events(sponsor_id);
