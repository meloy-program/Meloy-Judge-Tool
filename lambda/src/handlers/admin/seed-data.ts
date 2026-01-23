import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Seeding database with test data...');

    await transaction(async (client) => {
      // Insert test users
      await client.query(`
        INSERT INTO users (netid, email, first_name, last_name, role) VALUES
        ('admin001', 'admin@tamu.edu', 'John', 'Admin', 'admin'),
        ('mod001', 'moderator@tamu.edu', 'Jane', 'Moderator', 'moderator'),
        ('judge001', 'judge1@tamu.edu', 'Mike', 'Judge', 'judge'),
        ('judge002', 'judge2@tamu.edu', 'Sarah', 'Smith', 'judge'),
        ('part001', 'participant1@tamu.edu', 'Bob', 'Builder', 'participant'),
        ('part002', 'participant2@tamu.edu', 'Alice', 'Developer', 'participant'),
        ('part003', 'participant3@tamu.edu', 'Charlie', 'Coder', 'participant')
      `);

      // Insert sponsor
      await client.query(`
        INSERT INTO sponsors (name, logo_url, website_url, tier) VALUES
        ('TAMU Engineering', 'https://example.com/tamu-logo.png', 'https://engineering.tamu.edu', 'platinum')
      `);

      // Insert test events
      await client.query(`
        INSERT INTO events (name, description, event_type, status, location, start_date, end_date, registration_deadline, max_team_size, min_team_size, max_teams, sponsor_id)
        VALUES
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
        )
      `);

      // Get event and user IDs
      const hackathon = await client.query(`SELECT id FROM events WHERE name = 'Spring 2026 Hackathon'`);
      const hackathonId = hackathon.rows[0]?.id;

      if (hackathonId) {
        const adminId = (await client.query(`SELECT id FROM users WHERE netid = 'admin001'`)).rows[0]?.id;
        const part1Id = (await client.query(`SELECT id FROM users WHERE netid = 'part001'`)).rows[0]?.id;
        const part2Id = (await client.query(`SELECT id FROM users WHERE netid = 'part002'`)).rows[0]?.id;
        const part3Id = (await client.query(`SELECT id FROM users WHERE netid = 'part003'`)).rows[0]?.id;
        const judge1Id = (await client.query(`SELECT id FROM users WHERE netid = 'judge001'`)).rows[0]?.id;

        // Insert teams
        const teamResult = await client.query(`
          INSERT INTO teams (event_id, name, description, status) VALUES
          ($1, 'Code Warriors', 'Building an AI-powered task manager', 'approved'),
          ($1, 'Debug Squad', 'Creating a collaborative coding platform', 'approved'),
          ($1, 'Pending Team', 'Working on IoT solution', 'pending')
          RETURNING id
        `, [hackathonId]);

        if (teamResult.rows.length > 0) {
          const team1Id = teamResult.rows[0].id;
          const team2Id = teamResult.rows[1]?.id;

          // Add team members
          if (part1Id && part2Id && part3Id) {
            await client.query(`
              INSERT INTO team_members (team_id, user_id, role) VALUES
              ($1, $2, 'leader'),
              ($1, $3, 'member')
            `, [team1Id, part1Id, part2Id]);

            if (team2Id) {
              await client.query(`
                INSERT INTO team_members (team_id, user_id, role) VALUES
                ($1, $2, 'leader')
              `, [team2Id, part3Id]);
            }
          }

          // Add judges to event
          if (adminId && judge1Id) {
            await client.query(`
              INSERT INTO event_judges (event_id, user_id, assigned_by) VALUES
              ($1, $2, $3)
            `, [hackathonId, judge1Id, adminId]);
          }

          // Add submission and scores
          if (judge1Id) {
            const submissionResult = await client.query(`
              INSERT INTO submissions (team_id, judge_id, status, submitted_at) VALUES
              ($1, $2, 'completed', NOW() - INTERVAL '1 hour')
              RETURNING id
            `, [team1Id, judge1Id]);

            if (submissionResult.rows.length > 0) {
              const submissionId = submissionResult.rows[0].id;
              await client.query(`
                INSERT INTO scores (submission_id, category, score, max_score) VALUES
                ($1, 'technical_implementation', 85, 100),
                ($1, 'innovation', 90, 100),
                ($1, 'presentation', 78, 100)
              `, [submissionId]);
            }
          }
        }
      }
    });

    console.log('✅ Test data seeded successfully');

    return successResponse({
      message: 'Test data seeded successfully',
      summary: {
        users: 7,
        sponsors: 1,
        events: 2,
        teams: 3,
        judges: 2,
        submissions: 1,
        scores: 3
      }
    });
  } catch (error: any) {
    console.error('Seed data error:', error);
    return errorResponse('Failed to seed test data', 500, error);
  }
};
