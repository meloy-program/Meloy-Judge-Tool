/**
 * Users API endpoints
 */

import { get, put } from './client';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'member' | 'judge' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface UsersResponse {
    users: User[];
}

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
    role: 'member' | 'judge' | 'admin'
): Promise<{ user: User }> {
    return put<{ user: User }>(`/users/${userId}/role`, { role });
}
