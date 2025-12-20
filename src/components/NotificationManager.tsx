'use client';

import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import ToastNotification from '@/components/ToastNotification';

export default function NotificationManager() {
  const { isLoggedIn } = useAuth();
  const { activeToast, closeToast } = useNotifications(isLoggedIn);

  if (!activeToast) return null;

  return (
    <ToastNotification 
      message={activeToast.message} 
      link={activeToast.link} 
      onClose={closeToast} 
    />
  );
}