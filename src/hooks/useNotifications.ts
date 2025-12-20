'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: number;
  message: string;
  link?: string;
}

/**
 * Hook profissional para monitoramento de notificações em tempo real.
 * Implementa Polling de 15 segundos para baixo consumo de I/O no SQLite.
 */
export const useNotifications = (isLoggedIn: boolean) => {
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const checkNotifications = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const res = await fetch('/api/notifications/unread');
      if (!res.ok) return;
      
      const unread: Notification[] = await res.json();

      if (unread.length > 0) {
        // Exibe a mais recente
        setActiveToast(unread[0]);

        // Marca automaticamente como lida no backend para evitar loop
        await fetch('/api/notifications/unread', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: unread.map(n => n.id) })
        });
      }
    } catch (err) {
      console.error("[NOTIFY_HOOK_ERROR]", err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Checagem imediata ao montar
    checkNotifications();

    // Intervalo de monitoramento (15s)
    const timer = setInterval(checkNotifications, 15000);
    return () => clearInterval(timer);
  }, [isLoggedIn, checkNotifications]);

  const closeToast = () => setActiveToast(null);

  return { activeToast, closeToast };
};