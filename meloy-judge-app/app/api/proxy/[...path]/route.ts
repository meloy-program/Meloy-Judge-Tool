import { auth0 } from '@/lib/auth0';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function handleProxy(req: NextRequest, path: string[], method: string) {
    try {
        console.log('[Backend Proxy] Starting request:', { path, method });
        
        // Get Auth0 session
        const cookieStore = await cookies();
        const session = await auth0.getSession(req);
        
        if (!session?.user) {
            return NextResponse.json({ 
                error: 'Unauthorized - Not authenticated' 
            }, { status: 401 });
        }

        const idToken = session.tokenSet?.idToken;
        if (!idToken) {
            return NextResponse.json({ 
                error: 'Unauthorized - No ID token' 
            }, { status: 401 });
        }

        // Build backend URL
        const backendPath = path.join('/');
        const searchParams = req.nextUrl.searchParams.toString();
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const backendUrl = `${apiUrl}/${backendPath}${searchParams ? `?${searchParams}` : ''}`;

        // Get request body for non-GET requests
        let body = undefined;
        if (method !== 'GET' && method !== 'DELETE') {
            const text = await req.text();
            body = text || undefined;
        }

        console.log('[Backend Proxy] Calling:', backendUrl);

        // Forward request to Lambda via API Gateway
        const response = await fetch(backendUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body,
        });

        // Handle 204 No Content responses
        if (response.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        // Check if response is binary (Excel file) or CSV
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('spreadsheet') || contentType?.includes('octet-stream') || contentType?.includes('text/csv')) {
            const buffer = await response.arrayBuffer();
            return new NextResponse(buffer, {
                status: response.status,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': response.headers.get('content-disposition') || '',
                },
            });
        }

        // Handle JSON responses
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('[Backend Proxy] Error:', error.message);
        return NextResponse.json({ 
            error: 'Proxy error',
            details: error.message
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
