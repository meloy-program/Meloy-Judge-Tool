import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * POST /auth/logout
 * 
 * Logout endpoint - with JWT tokens, logout is handled client-side
 * This endpoint can be used for logging/analytics or future session management
 * 
 * Client should:
 * 1. Delete JWT token from storage
 * 2. Redirect to login page
 */

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('Logout event:', JSON.stringify(event, null, 2));

    // With stateless JWT, logout is client-side
    // In the future, we could:
    // - Add token to blacklist (Redis/DynamoDB)
    // - Log logout event to activity_log table
    // - Update judge_sessions table to set logged_out_at

    return successResponse({
      message: 'Logged out successfully',
      success: true,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Logout failed', 500);
  }
}
