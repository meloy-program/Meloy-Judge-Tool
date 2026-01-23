import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Initializing database schema...');

    await transaction(async (client) => {
      // Drop existing tables if they exist (CASCADE removes dependent objects)
      console.log('Dropping existing tables...');
      await client.query(`DROP TABLE IF EXISTS scores CASCADE`);
      await client.query(`DROP TABLE IF EXISTS submissions CASCADE`);
      await client.query(`DROP TABLE IF EXISTS event_judges CASCADE`);
      await client.query(`DROP TABLE IF EXISTS team_members CASCADE`);
      await client.query(`DROP TABLE IF EXISTS teams CASCADE`);
      await client.query(`DROP TABLE IF EXISTS events CASCADE`);
      await client.query(`DROP TABLE IF EXISTS sponsors CASCADE`);
      await client.query(`DROP TABLE IF EXISTS users CASCADE`);

      // Enable extensions
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

      // Create users table with netid for TAMU CAS authentication
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          netid VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'participant' 
            CHECK (role IN ('participant', 'judge', 'moderator', 'admin')),
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sponsors table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sponsors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          logo_url TEXT,
          website_url TEXT,
          tier VARCHAR(50) CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL 
            CHECK (event_type IN ('hackathon', 'design_competition', 'pitch_competition')),
          status VARCHAR(20) DEFAULT 'upcoming' 
            CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
          location VARCHAR(255),
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          registration_deadline TIMESTAMP,
          max_team_size INTEGER DEFAULT 4,
          min_team_size INTEGER DEFAULT 1,
          max_teams INTEGER,
          sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create teams table
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending' 
            CHECK (status IN ('pending', 'approved', 'rejected')),
          project_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, name)
        )
      `);

      // Create team_members table
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(20) DEFAULT 'member' 
            CHECK (role IN ('leader', 'member')),
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(team_id, user_id)
        )
      `);

      // Create event_judges table
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_judges (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_by UUID REFERENCES users(id),
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, user_id)
        )
      `);

      // Create submissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          judge_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending' 
            CHECK (status IN ('pending', 'in_progress', 'completed')),
          notes TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          UNIQUE(team_id, judge_id)
        )
      `);

      // Create scores table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scores (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
          category VARCHAR(100) NOT NULL,
          score INTEGER NOT NULL CHECK (score >= 0),
          max_score INTEGER NOT NULL DEFAULT 100 CHECK (max_score > 0),
          comments TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for performance
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_netid ON users(netid)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_submissions_judge_id ON submissions(judge_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_submission_id ON scores(submission_id)`);
    });

    console.log('✅ Database schema initialized successfully');

    return successResponse({
      message: 'Database schema initialized successfully',
      tables: [
        'users',
        'sponsors',
        'events',
        'teams',
        'team_members',
        'event_judges',
        'submissions',
        'scores'
      ]
    });
  } catch (error: any) {
    console.error('Schema initialization error:', error);
    return errorResponse('Failed to initialize schema', 500, error);
  }
};
