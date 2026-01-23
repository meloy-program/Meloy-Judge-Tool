-- Test Data for Judging Portal
-- Minimal dataset for testing API endpoints

-- Insert test users
INSERT INTO users (netid, email, first_name, last_name, role) VALUES
('admin001', 'admin@tamu.edu', 'John', 'Admin', 'admin'),
('mod001', 'moderator@tamu.edu', 'Jane', 'Moderator', 'moderator'),
('judge001', 'judge1@tamu.edu', 'Mike', 'Judge', 'judge'),
('judge002', 'judge2@tamu.edu', 'Sarah', 'Smith', 'judge'),
('part001', 'participant1@tamu.edu', 'Bob', 'Builder', 'participant'),
('part002', 'participant2@tamu.edu', 'Alice', 'Developer', 'participant'),
('part003', 'participant3@tamu.edu', 'Charlie', 'Coder', 'participant');

-- Insert sponsor
INSERT INTO sponsors (name, logo_url, website_url, tier) VALUES
('TAMU Engineering', 'https://example.com/tamu-logo.png', 'https://engineering.tamu.edu', 'platinum');

-- Insert test events
INSERT INTO events (name, description, event_type, status, location, start_date, end_date, registration_deadline, max_team_size, min_team_size, max_teams, sponsor_id) VALUES
(
  'Spring 2026 Hackathon',
  'Annual spring coding competition focusing on web development and AI',
  'hackathon',
  'active',
  'Zachry Engineering Center',
  '2026-03-15 09:00:00',
  '2026-03-15 18:00:00',
  '2026-03-10 23:59:59',
  4,
  2,
  20,
  (SELECT id FROM sponsors WHERE name = 'TAMU Engineering')
),
(
  'Summer Design Challenge',
  'UI/UX design competition for mobile applications',
  'design_competition',
  'upcoming',
  'Memorial Student Center',
  '2026-06-20 10:00:00',
  '2026-06-20 17:00:00',
  '2026-06-15 23:59:59',
  3,
  1,
  15,
  NULL
);

-- Get event IDs for reference
DO $$ 
DECLARE
  hackathon_id UUID;
  design_id UUID;
  admin_id UUID;
  mod_id UUID;
  part1_id UUID;
  part2_id UUID;
  part3_id UUID;
  team1_id UUID;
  team2_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO hackathon_id FROM events WHERE name = 'Spring 2026 Hackathon';
  SELECT id INTO design_id FROM events WHERE name = 'Summer Design Challenge';
  SELECT id INTO admin_id FROM users WHERE netid = 'admin001';
  SELECT id INTO mod_id FROM users WHERE netid = 'mod001';
  SELECT id INTO part1_id FROM users WHERE netid = 'part001';
  SELECT id INTO part2_id FROM users WHERE netid = 'part002';
  SELECT id INTO part3_id FROM users WHERE netid = 'part003';

  -- Insert teams for hackathon
  INSERT INTO teams (event_id, name, description, status) VALUES
  (hackathon_id, 'Code Warriors', 'Building an AI-powered task manager', 'approved'),
  (hackathon_id, 'Debug Squad', 'Creating a collaborative coding platform', 'approved'),
  (hackathon_id, 'Pending Team', 'Working on IoT solution', 'pending')
  RETURNING id INTO team1_id;

  -- Get team IDs
  SELECT id INTO team1_id FROM teams WHERE name = 'Code Warriors';
  SELECT id INTO team2_id FROM teams WHERE name = 'Debug Squad';

  -- Add team members
  INSERT INTO team_members (team_id, user_id, role) VALUES
  (team1_id, part1_id, 'leader'),
  (team1_id, part2_id, 'member'),
  (team2_id, part3_id, 'leader');

  -- Add judges to event
  INSERT INTO event_judges (event_id, user_id, assigned_by) VALUES
  (hackathon_id, (SELECT id FROM users WHERE netid = 'judge001'), admin_id),
  (hackathon_id, (SELECT id FROM users WHERE netid = 'judge002'), admin_id);

  -- Add some submissions
  INSERT INTO submissions (team_id, judge_id, status, submitted_at) VALUES
  (team1_id, (SELECT id FROM users WHERE netid = 'judge001'), 'completed', NOW() - INTERVAL '1 hour'),
  (team2_id, (SELECT id FROM users WHERE netid = 'judge001'), 'in_progress', NOW() - INTERVAL '30 minutes');

  -- Add scores for completed submission
  INSERT INTO scores (submission_id, category, score, max_score) VALUES
  (
    (SELECT id FROM submissions WHERE team_id = team1_id AND judge_id = (SELECT id FROM users WHERE netid = 'judge001')),
    'technical_implementation',
    85,
    100
  ),
  (
    (SELECT id FROM submissions WHERE team_id = team1_id AND judge_id = (SELECT id FROM users WHERE netid = 'judge001')),
    'innovation',
    90,
    100
  ),
  (
    (SELECT id FROM submissions WHERE team_id = team1_id AND judge_id = (SELECT id FROM users WHERE netid = 'judge001')),
    'presentation',
    78,
    100
  );
END $$;
