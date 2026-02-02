/**
 * Admin and User Management API endpoints
 */

import { get, post, put } from './client';
import type { UsersResponse, User, ActivityResponse } from '../types/api';

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<UsersResponse> {
    return get<UsersResponse>('/users');
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    userId: string,
    role: string
): Promise<{ user: User }> {
    return put<{ user: User }>(`/users/${userId}/role`, { role });
}

/**
 * Get activity log (admin only)
 */
export async function getActivity(limit = 50): Promise<ActivityResponse> {
    return get<ActivityResponse>(`/activity?limit=${limit}`);
}

/**
 * Seed test data (admin only)
 */
export async function seedData(): Promise<{ message: string }> {
    return post<{ message: string }>('/admin/seed-data');
}
