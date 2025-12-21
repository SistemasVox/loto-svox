// ======================================================================
// SISTEMA LOTO - GESTÃO DE NOTIFICAÇÕES (HOOK + PROVIDER TSX)
// ======================================================================

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// --- CONSTANTES (ZERO MAGIC NUMBERS) ---
const DURACAO_PADRAO_MS = 6000;

interface Notificacao {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface ContextoNotificacao {
  notifications: Notificacao[];
  addNotification: (n: Omit<Notificacao, "id">) => void;
  removeNotification: (id: string) => void;
}

const ContextoNotificacao = createContext<ContextoNotificacao | undefined>(undefined);

/**
 * Provedor de Notificações: Essencial para o funcionamento dos Toasts.
 * O arquivo deve ter extensão .tsx para suportar esta sintaxe.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const adicionarNotificacao = useCallback((n: Omit<Notificacao, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const novaNotificacao = { ...n, id };

    setNotificacoes((prev) => [...prev, novaNotificacao]);

    // Heurística de Jakob Nielsen: Visibilidade do Status do Sistema
    setTimeout(() => {
      removerNotificacao(id);
    }, n.duration || DURACAO_PADRAO_MS);
  }, [removerNotificacao]);

  return (
    <ContextoNotificacao.Provider value={{ 
      notifications: notificacoes, 
      addNotification: adicionarNotificacao, 
      removeNotification: removerNotificacao 
    }}>
      {children}
    </ContextoNotificacao.Provider>
  );
}

/**
 * Hook para consumo de notificações em Client Components.
 * Inclui fallback para prevenir erros de runtime.
 */
export function useNotifications() {
  const contexto = useContext(ContextoNotificacao);
  if (!contexto) {
    return {
      notifications: [],
      addNotification: () => console.warn("[SISTEMA] NotificationProvider não localizado no layout."),
      removeNotification: () => {}
    };
  }
  return contexto;
}