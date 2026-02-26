-- ============================================================================
-- Migration: Add Mentor Names and Team Awards Support
-- Created: 2026-02-18
-- Description: Adds mentor_name to teams table and creates team_awards table
--              for storing official rankings and special awards
-- ============================================================================

-- ============================================================================
-- 1. Add mentor_name to teams table
-- ============================================================================

ALTER TABLE teams 
ADD COLUMN mentor_name VARCHAR(255);

COMMENT ON COLUMN teams.mentor_name IS 'Name of team mentor/advisor (optional)';

-- ============================================================================
-- 2. Create team_awards table for official rankings and special awards
-- ============================================================================

CREATE TABLE team_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    award_type VARCHAR(50) NOT NULL CHECK (award_type IN (
        'first_place',
        'second_place', 
        'third_place',
        'most_feasible',
        'best_prototype',
        'best_video',
        'best_presentation'
    )),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- One team per award type per event
    UNIQUE(event_id, award_type)
);

COMMENT ON TABLE team_awards IS 'Official event rankings and special awards assigned by admins';
COMMENT ON COLUMN team_awards.award_type IS 'Type of award: first_place, second_place, third_place, most_feasible, best_prototype, best_video, best_presentation';
COMMENT ON COLUMN team_awards.awarded_by IS 'Admin user who assigned the award';

-- ============================================================================
-- 3. Create indexes for performance
-- ============================================================================

CREATE INDEX idx_team_awards_event ON team_awards(event_id);
CREATE INDEX idx_team_awards_team ON team_awards(team_id);
CREATE INDEX idx_team_awards_type ON team_awards(event_id, award_type);

-- ============================================================================
-- 4. Create helper view for awards display
-- ============================================================================

CREATE VIEW event_awards_summary AS
SELECT 
    e.id as event_id,
    e.name as event_name,
    ta.award_type,
    t.id as team_id,
    t.name as team_name,
    t.project_title,
    ta.awarded_at,
    u.name as awarded_by_name
FROM events e
LEFT JOIN team_awards ta ON e.id = ta.event_id
LEFT JOIN teams t ON ta.team_id = t.id
LEFT JOIN users u ON ta.awarded_by = u.id
ORDER BY e.id, 
    CASE ta.award_type
        WHEN 'first_place' THEN 1
        WHEN 'second_place' THEN 2
        WHEN 'third_place' THEN 3
        WHEN 'most_feasible' THEN 4
        WHEN 'best_prototype' THEN 5
        WHEN 'best_video' THEN 6
        WHEN 'best_presentation' THEN 7
    END;

COMMENT ON VIEW event_awards_summary IS 'Summary of all awards for all events with team details';

-- ============================================================================
-- Migration Complete
-- ============================================================================
