'use client';

import { AdminScreen } from '@/components/management/admin/admin-screen';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Show success toast if redirected from event creation
  useEffect(() => {
    const success = searchParams.get('success');
    const eventName = searchParams.get('eventName');
    
    if (success === 'true' && eventName) {
      toast({
        title: "Event Created Successfully",
        description: `${decodeURIComponent(eventName)} has been created with all configurations.`,
      });
      
      // Clean up URL parameters
      router.replace('/admin');
    }
  }, [searchParams, toast, router]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleCreateEvent = () => {
    router.push('/admin/events/create');
  };

  const handleManageEvent = (eventId: string) => {
    router.push(`/admin/events/${eventId}/manage`);
  };

  return (
    <AdminScreen
      onBack={handleBack}
      onCreateEvent={handleCreateEvent}
      onManageEvent={handleManageEvent}
    />
  );
}
