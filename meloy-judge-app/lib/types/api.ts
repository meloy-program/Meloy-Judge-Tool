/**
 * API Types matching backend database schema
 */

export interface Event {
    id: string;
    name: string;
    description: string;
    event_type: string;
    status: string;
    location: string;
    start_date: string;
    end_date: string;
    registration_deadline: string | null;
    max_team_size: number;
    min_team_size: number;
    max_teams: number | null;
    sponsor_id: string | null;
    judging_phase: string;
    current_active_team_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Team {
    id: string;
    event_id: string;
    name: string;
    description: string;
    project_url: string | null;
    presentation_order: number | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    netid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'moderator' | 'judge' | 'participant';
    is_active: boolean;
    created_at: string;
}

export interface RubricCriteria {
    id: string;
    name: string;
    short_name: string;
    description: string;
    max_score: number;
    display_order: number;
    icon_name: string;
    guiding_question: string;
    created_at: string;
}

export interface ScoreSubmission {
    eventId: string;
    teamId: string;
    scores: Array<{
        criteria_id: string;
        score: number;
    }>;
    reflections?: Record<string, string>;
    timeSpentSeconds?: number;
}

export interface LeaderboardEntry {
    team_id: string;
    team_name: string;
    total_score: number;
    avg_score: number;
    judges_scored: number;
    rank: number;
}

export interface ActivityLogEntry {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: any;
    created_at: string;
    user_name?: string;
}

export interface EventInsights {
    total_teams: string;
    total_judges: string;
    completed_scores: string;
    average_score: number | null;
}

export interface JudgeSession {
    id: string;
    name: string;
    last_activity: string;
    is_online: boolean;
}

// API Response wrappers
export interface ApiResponse<T> {
    [key: string]: T;
}

export interface EventsResponse {
    events: Event[];
    total: number;
}

export interface TeamsResponse {
    teams: Team[];
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
}

export interface RubricResponse {
    criteria: RubricCriteria[];
}

export interface UsersResponse {
    users: User[];
}

export interface ActivityResponse {
    activities: ActivityLogEntry[];
}

export interface InsightsResponse {
    insights: EventInsights;
}

export interface JudgesOnlineResponse {
    judges: JudgeSession[];
}
