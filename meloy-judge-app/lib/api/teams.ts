/**
 * Teams API endpoints
 */

import { get, post, put, del } from './client';
import type { Team } from '../types/api';

/**
 * Get a single team by ID
 */
export async function getTeam(teamId: string): Promise<{ team: Team }> {
    return get<{ team: Team }>(`/teams/${teamId}`);
}

/**
 * Create a new team for an event (admin only)
 */
export async function createTeam(
    eventId: string,
    data: Partial<Team>
): Promise<{ team: Team }> {
    return post<{ team: Team }>(`/events/${eventId}/teams`, data);
}

/**
 * Update a team (admin only)
 */
export async function updateTeam(
    teamId: string,
    data: Partial<Team>
): Promise<{ team: Team }> {
    return put<{ team: Team }>(`/teams/${teamId}`, data);
}

/**
 * Delete a team (admin only)
 */
export async function deleteTeam(teamId: string): Promise<void> {
    return del<void>(`/teams/${teamId}`);
}
