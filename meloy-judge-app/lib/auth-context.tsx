'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  isTokenValid: boolean;
  isValidating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isTokenValid: false,
  isValidating: true,
});

export function useAuthToken() {
  return useContext(AuthContext);
}

export function AuthTokenProvider({ children }: { children: ReactNode }) {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function validateToken() {
      setIsValidating(true);
      
      try {
        console.log('[AuthTokenProvider] Validating token...');
        
        // Make a test API call to verify the token actually works with backend
        const response = await fetch('/api/proxy/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[AuthTokenProvider] Token validation response:', response.status);
        
        if (!response.ok) {
          console.log('[AuthTokenProvider] Token invalid, redirecting to login');
          window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(pathname)}`;
          return;
        }

        console.log('[AuthTokenProvider] Token is valid');
        setIsTokenValid(true);
      } catch (error) {
        console.error('[AuthTokenProvider] Token validation error:', error);
        window.location.href = `/api/auth/login?returnTo=${encodeURIComponent(pathname)}`;
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ isTokenValid, isValidating }}>
      {children}
    </AuthContext.Provider>
  );
}
