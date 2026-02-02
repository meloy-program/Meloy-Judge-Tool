/**
 * Events API endpoints
 */

import { get, post, put, del } from './client';
import type {
    EventsResponse,
    Event,
    TeamsResponse,
    LeaderboardResponse,
    InsightsResponse,
    JudgesOnlineResponse,
} from '../types/api';

/**
 * Get all events with optional filters
 */
export async function getEvents(filters?: {
    status?: string;
    type?: string;
}): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    return get<EventsResponse>(`/events${query ? `?${query}` : ''}`);
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string): Promise<{ event: Event }> {
    return get<{ event: Event }>(`/events/${id}`);
}

/**
 * Create a new event (admin only)
 */
export async function createEvent(data: Partial<Event>): Promise<{ event: Event }> {
    return post<{ event: Event }>('/events', data);
}

/**
 * Update an event (admin/moderator)
 */
export async function updateEvent(
    id: string,
    data: Partial<Event>
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${id}`, data);
}

/**
 * Delete an event (admin only)
 */
export async function deleteEvent(id: string): Promise<void> {
    return del<void>(`/events/${id}`);
}

/**
 * Get teams for an event
 */
export async function getEventTeams(eventId: string): Promise<TeamsResponse> {
    return get<TeamsResponse>(`/events/${eventId}/teams`);
}

/**
 * Get leaderboard for an event
 */
export async function getEventLeaderboard(
    eventId: string
): Promise<LeaderboardResponse> {
    return get<LeaderboardResponse>(`/events/${eventId}/leaderboard`);
}

/**
 * Get insights for an event (admin only)
 */
export async function getEventInsights(
    eventId: string
): Promise<InsightsResponse> {
    return get<InsightsResponse>(`/events/${eventId}/insights`);
}

/**
 * Get online judges for an event
 */
export async function getOnlineJudges(
    eventId: string
): Promise<JudgesOnlineResponse> {
    return get<JudgesOnlineResponse>(`/events/${eventId}/judges/online`);
}

/**
 * Update active team (moderator)
 */
export async function updateActiveTeam(
    eventId: string,
    teamId: string | null
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${eventId}/team-active`, {
        current_active_team_id: teamId,
    });
}

/**
 * Update judging phase (moderator)
 */
export async function updateJudgingPhase(
    eventId: string,
    phase: string
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${eventId}/judging-phase`, {
        judging_phase: phase,
    });
}

/**
 * Get moderator status for an event
 */
export async function getModeratorStatus(eventId: string): Promise<any> {
    return get<any>(`/events/${eventId}/moderator/status`);
}

/**
 * Get judge's progress for an event
 */
export async function getMyProgress(eventId: string): Promise<any> {
    return get<any>(`/events/${eventId}/my-progress`);
}
