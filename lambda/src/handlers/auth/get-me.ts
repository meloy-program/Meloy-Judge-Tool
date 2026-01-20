import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { userQueries } from '../../db/queries';
import { verifyJwt, extractTokenFromHeader } from '../../utils/jwt';
import { successResponse, errorResponse } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

/**
 * GET /auth/me
 * 
 * Returns the currently authenticated user's profile
 * Requires valid JWT token in Authorization header
 */

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('Get me event:', JSON.stringify(event, null, 2));

    // Extract JWT token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('Missing authentication token');
    }

    // Verify JWT and extract user ID
    const payload = await verifyJwt(token);
    console.log('JWT payload:', payload);

    // Fetch user from database
    const user = await userQueries.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Return user profile (exclude sensitive fields)
    return successResponse({
      user: {
        id: user.id,
        netId: user.netid,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);

    if (error instanceof UnauthorizedError) {
      return errorResponse(error.message, error.statusCode);
    }

    if (error instanceof Error && error.message.includes('Token')) {
      return errorResponse('Invalid or expired token', 401);
    }

    return errorResponse('Failed to fetch user profile', 500);
  }
}
