import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { query, queryOne, transaction } from './db/connection';
import { verifyJwt } from './utils/jwt';

const app = express();

// Middleware - MUST be before routes
app.use(express.json());
app.use(cors());

// Logging middleware for debugging (remove in production)
app.use((req, _res, next) => {
    console.log('[REQUEST]', {
        method: req.method,
        path: req.path,
        url: req.url,
        query: req.query,
        headers: req.headers
    });
    next();
});


// Custom types for authenticated requests
interface AuthRequest extends Request {
    user?: {
        id: string;
        netId?: string;
        role: string;
    };
}

// ⚠️ DEVELOPMENT MODE - Remove before production!
const DEV_MODE = process.env.DEV_MODE === 'true';
const MOCK_USER = {
    id: '00000000-0000-0000-0000-000000000001',
    netId: 'testuser',
    role: 'admin' // Can be: 'admin', 'moderator', 'judge'
};

if (DEV_MODE) {
    console.warn('🚨 WARNING: DEV_MODE is enabled - Authentication is BYPASSED!');
    console.warn('🚨 Mock user:', MOCK_USER);
}

// Authentication middleware
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // ⚠️ DEVELOPMENT MODE BYPASS
    if (DEV_MODE) {
        console.log('🔓 DEV_MODE: Bypassing authentication');
        req.user = MOCK_USER;
        next();
        return;
    }

    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ error: 'Unauthorized - No token provided' });
            return;
        }

        const payload = await verifyJwt(token) as any;
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
        return;
    }
};

// Role-based authorization middleware
const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
            return;
        }
        next();
    };
};

// ==================== HEALTH & AUTH ====================

app.get('/health', async (_req, res) => {
    try {
        await query('SELECT 1 as health');
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error });
    }
});

app.get('/auth/cas-callback', async (_req, res) => {
    try {
        // TODO: Implement CAS validation with req.query.ticket
        res.json({ message: 'CAS callback - to be implemented' });
    } catch (error) {
        res.status(500).json({ error: 'CAS callback failed' });
    }
});

app.get('/auth/me', authenticate, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

app.post('/auth/logout', authenticate, async (req: AuthRequest, res) => {
    try {
        const eventId = req.body.eventId;
        if (eventId) {
            await query(
                'UPDATE judge_sessions SET logged_out_at = NOW() WHERE user_id = $1 AND event_id = $2 AND logged_out_at IS NULL',
                [req.user!.id, eventId]
            );
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// ==================== EVENTS ====================

app.get('/events', async (req, res) => {
    try {
        const { status, type } = req.query;
        const conditions: string[] = ['1=1'];
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`e.status = $${paramIndex++}`);
            params.push(status);
        }

        if (type) {
            conditions.push(`e.event_type = $${paramIndex++}`);
            params.push(type);
        }

        const events = await query(
            `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
          'website_url', s.website_url,
          'tier', s.tier,
          'primary_color', s.primary_color,
          'secondary_color', s.secondary_color,
          'text_color', s.text_color
        ) as sponsor,
        (SELECT COUNT(*) FROM teams WHERE event_id = e.id) as teams_count,
        (SELECT COUNT(*) FROM event_judges WHERE event_id = e.id) as judges_count
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.start_date DESC NULLS LAST, e.created_at DESC`,
            params
        );

        res.json({ events, total: events.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/events/:id', async (req, res): Promise<void> => {
    try {
        const eventData = await queryOne(
            `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
          'website_url', s.website_url,
          'tier', s.tier,
          'primary_color', s.primary_color,
          'secondary_color', s.secondary_color,
          'text_color', s.text_color
       ) as sponsor
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE e.id = $1`,
            [req.params.id]
        );

        if (!eventData) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const teams = await query(
            `SELECT 
        t.id,
        t.name,
        t.description,
        t.status,
        t.project_url,
        COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      WHERE t.event_id = $1
      GROUP BY t.id, t.name, t.description, t.status, t.project_url
      ORDER BY t.created_at ASC`,
            [req.params.id]
        );

        const submissionStats = await queryOne<{
            total_submissions: string;
            completed_submissions: string;
        }>(
            `SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN ss.submitted_at IS NOT NULL THEN 1 END) as completed_submissions
      FROM score_submissions ss
      JOIN teams t ON ss.team_id = t.id
      WHERE t.event_id = $1`,
            [req.params.id]
        );

        res.json({
            event: eventData,
            teams,
            stats: {
                totalTeams: teams.length,
                totalSubmissions: parseInt(submissionStats?.total_submissions || '0', 10),
                completedSubmissions: parseInt(submissionStats?.completed_submissions || '0', 10),
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

app.post('/events', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
        const { name, event_type, start_date, end_date, location, description } = req.body;

        const event = await queryOne(
            `INSERT INTO events (name, event_type, start_date, end_date, location, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, event_type, start_date, end_date, location, description]
        );

        res.status(201).json({ event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

app.put('/events/:eventId', authenticate, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = [req.params.eventId, ...Object.values(updates)];

        const event = await queryOne(
            `UPDATE events SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );

        res.json({ event });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

app.delete('/events/:eventId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM events WHERE id = $1', [req.params.eventId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

app.get('/events/:eventId/leaderboard', async (req, res) => {
    try {
        const leaderboard = await query(
            `SELECT 
        t.id,
        t.name,
        t.project_title,
        COALESCE(SUM(s.score), 0) as total_score,
        COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_scored
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE t.event_id = $1
      GROUP BY t.id
      ORDER BY total_score DESC, t.name ASC`,
            [req.params.eventId]
        );

        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.get('/events/:eventId/insights', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const insights = await queryOne(
            `SELECT 
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT ss.user_id) as total_judges,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.submitted_at IS NOT NULL) as completed_scores,
        AVG(s.score) as average_score
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      LEFT JOIN scores s ON ss.id = s.submission_id
      WHERE t.event_id = $1`,
            [req.params.eventId]
        );

        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

app.get('/events/:eventId/judges/online', async (req, res) => {
    try {
        const judges = await query(
            `SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        js.last_activity,
        CASE 
          WHEN js.last_activity > NOW() - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM users u
      JOIN judge_sessions js ON u.id = js.user_id
      WHERE js.event_id = $1 AND js.logged_out_at IS NULL
      ORDER BY js.last_activity DESC`,
            [req.params.eventId]
        );

        // Return empty array if no judges, not an error
        res.json({ judges: judges || [] });
    } catch (error) {
        // If query fails (e.g., invalid event ID), still return empty array
        console.error('Error fetching online judges:', error);
        res.json({ judges: [] });
    }
});

app.put('/events/:eventId/team-active', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { teamId } = req.body;

        await query(
            'UPDATE events SET current_active_team_id = $1, updated_at = NOW() WHERE id = $2',
            [teamId, req.params.eventId]
        );

        res.json({ message: 'Active team updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update active team' });
    }
});

app.put('/events/:eventId/judging-phase', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const { phase } = req.body;

        await query(
            'UPDATE events SET judging_phase = $1, updated_at = NOW() WHERE id = $2',
            [phase, req.params.eventId]
        );

        res.json({ message: 'Judging phase updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update judging phase' });
    }
});

app.get('/events/:eventId/moderator/status', authenticate, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
        const status = await queryOne(
            `SELECT 
        e.id,
        e.name,
        e.judging_phase,
        e.current_active_team_id,
        t.name as active_team_name
      FROM events e
      LEFT JOIN teams t ON e.current_active_team_id = t.id
      WHERE e.id = $1`,
            [req.params.eventId]
        );

        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch moderator status' });
    }
});

// ==================== TEAMS ====================

app.get('/events/:eventId/teams', async (req, res) => {
    try {
        const teams = await query(
            `SELECT 
        t.*,
        COUNT(DISTINCT ss.id) as total_scores,
        COUNT(DISTINCT CASE WHEN ss.submitted_at IS NOT NULL THEN ss.id END) as completed_scores,
        ROUND(AVG(
          CASE WHEN ss.submitted_at IS NOT NULL 
          THEN (SELECT SUM(score) FROM scores WHERE submission_id = ss.id)
          END
        ), 2) as average_score
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      WHERE t.event_id = $1
      GROUP BY t.id
      ORDER BY t.presentation_order ASC, t.created_at DESC`,
            [req.params.eventId]
        );

        res.json({ teams });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

app.get('/teams/:teamId', async (req, res): Promise<void> => {
    try {
        const team = await queryOne(
            `SELECT t.*, e.name as event_name 
       FROM teams t
       JOIN events e ON t.event_id = e.id
       WHERE t.id = $1`,
            [req.params.teamId]
        );

        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }

        const members = await query(
            'SELECT * FROM team_members WHERE team_id = $1',
            [req.params.teamId]
        );

        res.json({ team, members });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

app.post('/events/:eventId/teams', authenticate, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
        const { name, description, project_url, presentation_order } = req.body;

        const team = await queryOne(
            `INSERT INTO teams (event_id, name, description, project_url, presentation_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [req.params.eventId, name, description, project_url, presentation_order]
        );

        res.status(201).json({ team });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team' });
    }
});

app.put('/teams/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const updates = req.body;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }

        const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
        const values = [req.params.teamId, ...Object.values(updates)];

        const team = await queryOne(
            `UPDATE teams SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            values
        );

        res.json({ team });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team' });
    }
});

app.delete('/teams/:teamId', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        await query('DELETE FROM teams WHERE id = $1', [req.params.teamId]);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// ==================== SCORES ====================

app.post('/scores', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId, teamId, scores, overallComments, timeSpentSeconds } = req.body;
        const userId = req.user!.id;

        await transaction(async (client) => {
            // Create or update score submission
            const submissionResult = await client.query(
                `INSERT INTO score_submissions (user_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
         VALUES ($1, $2, $3, NOW(), NOW(), $4)
         ON CONFLICT (user_id, team_id) 
         DO UPDATE SET submitted_at = NOW(), time_spent_seconds = $4
         RETURNING id`,
                [userId, eventId, teamId, timeSpentSeconds || 0]
            );

            const submissionId = submissionResult.rows[0].id;

            // Delete existing scores
            await client.query('DELETE FROM scores WHERE submission_id = $1', [submissionId]);

            // Insert new scores
            for (const score of scores) {
                await client.query(
                    `INSERT INTO scores (submission_id, user_id, team_id, rubric_criteria_id, score, reflection)
           VALUES ($1, $2, $3, $4, $5, $6)`,
                    [submissionId, userId, teamId, score.criteriaId, score.score, score.reflection || null]
                );
            }

            // Insert or update overall comment
            if (overallComments) {
                await client.query(
                    `INSERT INTO judge_comments (submission_id, user_id, team_id, comments)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, team_id)
           DO UPDATE SET comments = $4, updated_at = NOW()`,
                    [submissionId, userId, teamId, overallComments]
                );
            }

            // Log activity
            await client.query(
                `INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
         VALUES ($1, $2, 'Scores Submitted', $3, 'score_submitted', 'CheckCircle', 'success')`,
                [eventId, userId, 'Judge submitted scores for team']
            );
        });

        res.json({ message: 'Scores submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit scores' });
    }
});

// ==================== RUBRIC ====================

app.get('/rubric', async (_req, res) => {
    try {
        const criteria = await query(
            'SELECT * FROM rubric_criteria ORDER BY display_order ASC'
        );

        res.json({ criteria });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rubric' });
    }
});

// ==================== JUDGE ====================

app.post('/judge/heartbeat', authenticate, async (req: AuthRequest, res) => {
    try {
        const { eventId } = req.body;

        await query(
            `UPDATE judge_sessions 
       SET last_activity = NOW() 
       WHERE user_id = $1 AND event_id = $2 AND logged_out_at IS NULL`,
            [req.user!.id, eventId]
        );

        res.json({ lastActivity: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ error: 'Heartbeat failed' });
    }
});

app.get('/events/:eventId/my-progress', authenticate, async (req: AuthRequest, res) => {
    try {
        const progress = await query(
            `SELECT 
        t.id as team_id,
        t.name as team_name,
        ss.submitted_at,
        CASE WHEN ss.submitted_at IS NOT NULL THEN true ELSE false END as is_completed
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id AND ss.user_id = $1
      WHERE t.event_id = $2
      ORDER BY t.presentation_order`,
            [req.user!.id, req.params.eventId]
        );

        res.json({ progress });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// ==================== USERS ====================

app.get('/users', authenticate, requireRole(['admin']), async (_req, res) => {
    try {
        const users = await query('SELECT id, netid, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/users/:userId/role', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;

        const user = await queryOne(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, netid, email, first_name, last_name, role',
            [role, req.params.userId]
        );

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// ==================== ADMIN ====================

app.post('/admin/init-schema', async (_req, res) => {
    try {
        // This endpoint is deprecated - schema should be initialized via migration scripts
        // or manually via database/schema.sql
        res.status(501).json({
            error: 'Not implemented',
            message: 'Please run schema initialization manually using database/schema.sql'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize schema' });
    }
});

app.post('/admin/seed-data', async (_req, res) => {
    try {
        // Seed test data logic here
        res.json({ message: 'Data seeded successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

app.get('/activity', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const activities = await query(
            `SELECT al.*, 
                    CONCAT(u.first_name, ' ', u.last_name) as user_name
       FROM activity_log al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
            [limit]
        );

        res.json({ activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Export Lambda handler with basePath for API Gateway stage
export const handler = serverless(app, {
    basePath: '/prod'
});
