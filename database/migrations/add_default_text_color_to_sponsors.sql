-- Migration: Add default text_color to existing sponsors
-- This ensures all sponsors have a text_color value

-- Update all sponsors that don't have a text_color set
UPDATE sponsors 
SET text_color = '#FFFFFF' 
WHERE text_color IS NULL;

-- Verify the update
SELECT id, name, text_color FROM sponsors;
