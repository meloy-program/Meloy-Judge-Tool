import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export const dynamic = 'force-dynamic';

// Initialize Lambda client
const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const BACKEND_LAMBDA_NAME = 'meloy-judge-api';

async function handleProxy(req: NextRequest, path: string[], method: string) {
    try {
        console.log('[Backend Proxy] Starting request:', { path, method });
        
        // Get Auth0 session using cookies helper for Amplify compatibility
        const cookieStore = await cookies();
        console.log('[Backend Proxy] Got cookie store');
        
        const session = await auth0.getSession(req);
        console.log('[Backend Proxy] Got session:', { hasSession: !!session, hasUser: !!session?.user });
        
        if (!session?.user) {
            console.log('[Backend Proxy] No session or user');
            return NextResponse.json({ 
                error: 'Unauthorized - Not authenticated' 
            }, { status: 401 });
        }

        // In v4, tokens are nested under tokenSet
        const idToken = session.tokenSet?.idToken;
        console.log('[Backend Proxy] Got token:', { hasToken: !!idToken });

        if (!idToken) {
            console.log('[Backend Proxy] No ID token');
            return NextResponse.json({ 
                error: 'Unauthorized - No ID token' 
            }, { status: 401 });
        }

        // Build the path for Lambda
        const backendPath = path.join('/');
        const searchParams = req.nextUrl.searchParams.toString();
        const fullPath = `/${backendPath}${searchParams ? `?${searchParams}` : ''}`;
        console.log('[Backend Proxy] Lambda path:', fullPath);

        // Get request body for non-GET requests
        let body = undefined;
        if (method !== 'GET' && method !== 'DELETE') {
            const text = await req.text();
            body = text || undefined;
        }

        // Create Lambda event payload (API Gateway format)
        const lambdaEvent = {
            version: '2.0',
            routeKey: `${method} ${fullPath}`,
            rawPath: fullPath,
            rawQueryString: searchParams,
            headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${idToken}`,
            },
            requestContext: {
                http: {
                    method,
                    path: fullPath,
                },
            },
            body: body || null,
            isBase64Encoded: false,
        };

        console.log('[Backend Proxy] Invoking Lambda directly...');
        
        // Invoke Lambda directly
        const command = new InvokeCommand({
            FunctionName: BACKEND_LAMBDA_NAME,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(lambdaEvent),
        });

        const lambdaResponse = await lambdaClient.send(command);
        console.log('[Backend Proxy] Lambda invoked, status:', lambdaResponse.StatusCode);

        // Parse Lambda response
        const responsePayload = JSON.parse(
            new TextDecoder().decode(lambdaResponse.Payload)
        );

        // Extract status and body from Lambda response
        const statusCode = responsePayload.statusCode || 200;
        const responseBody = responsePayload.body 
            ? (typeof responsePayload.body === 'string' 
                ? JSON.parse(responsePayload.body) 
                : responsePayload.body)
            : {};

        console.log('[Backend Proxy] Returning response, status:', statusCode);
        
        return NextResponse.json(responseBody, { status: statusCode });

    } catch (error: any) {
        console.error('[Backend Proxy] Error:', error);
        console.error('[Backend Proxy] Error stack:', error.stack);
        console.error('[Backend Proxy] Error details:', {
            message: error.message,
            name: error.name,
            cause: error.cause
        });
        return NextResponse.json({ 
            error: 'Proxy error',
            details: error.message,
            name: error.name
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PUT');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleProxy(req, path, 'DELETE');
}
