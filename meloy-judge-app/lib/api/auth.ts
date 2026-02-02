/**
 * Authentication API endpoints
 */

import { get, post } from './client';
import type { User } from '../types/api';

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: User }> {
    return get<{ user: User }>('/auth/me');
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ message: string }> {
    return post<{ message: string }>('/auth/logout');
}

/**
 * CAS callback handler (for future use)
 */
export async function casCallback(ticket: string): Promise<any> {
    return get<any>(`/auth/cas-callback?ticket=${ticket}`);
}
