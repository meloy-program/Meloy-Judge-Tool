/**
 * Scores and Rubric API endpoints
 */

import { get, post } from './client';
import type { ScoreSubmission, RubricResponse } from '../types/api';

/**
 * Get rubric criteria
 */
export async function getRubric(): Promise<RubricResponse> {
    return get<RubricResponse>('/rubric');
}

/**
 * Submit scores for a team
 */
export async function submitScore(
    data: ScoreSubmission
): Promise<{ message: string }> {
    return post<{ message: string }>('/scores', data);
}

/**
 * Submit judge heartbeat
 */
export async function submitHeartbeat(data: {
    eventId: string;
}): Promise<{ lastActivity: string }> {
    return post<{ lastActivity: string }>('/judge/heartbeat', data);
}
