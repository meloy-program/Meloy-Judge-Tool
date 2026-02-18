'use client';

import { EventCreationScreen } from '@/components/management/event-creation-screen';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';
import { useAuthToken } from '@/lib/auth-context';

export default function EventCreatePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('judge');
  const [loading, setLoading] = useState(true);
  const { isTokenValid, isValidating } = useAuthToken();

  useEffect(() => {
    if (isValidating || !isTokenValid) {
      return;
    }

    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUserRole(userData.user.role);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [isTokenValid, isValidating]);

  const handleBack = () => {
    router.push('/admin');
  };

  // Only allow admin access
  if (loading || isValidating) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <EventCreationScreen
      onBack={handleBack}
    />
  );
}
