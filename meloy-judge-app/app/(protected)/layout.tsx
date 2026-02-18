'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthTokenProvider } from '@/lib/auth-context';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login with return URL
      router.push(`/api/auth/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  // Validate token when user is loaded
  useEffect(() => {
    async function validateToken() {
      if (!user || isLoading) {
        setIsValidatingToken(false);
        return;
      }

      try {
        console.log('[ProtectedLayout] Validating token...');
        
        // Use proxy route to avoid CORS issues
        const response = await fetch('/api/proxy/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[ProtectedLayout] Token validation response:', response.status);
        
        if (!response.ok) {
          console.log('[ProtectedLayout] Token validation failed, redirecting to login');
          // Token is invalid/expired, redirect to login
          window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(pathname)}`;
          return;
        }

        // Token is valid
        console.log('[ProtectedLayout] Token is valid');
        setIsValidatingToken(false);
      } catch (error) {
        console.error('[ProtectedLayout] Token validation error:', error);
        // On error, redirect to login
        window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(pathname)}`;
      }
    }

    validateToken();
  }, [user, isLoading, pathname]);

  if (isLoading || isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthTokenProvider>
      {children}
    </AuthTokenProvider>
  );
}
