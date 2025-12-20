// src/app/minha-conta/notificacoes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

type Note = {
  id: number;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificacoesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/auth/notifications", { credentials: "include" });
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/auth/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
    });
    load();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Notificações</h1>

      {loading ? (
        <p>Carregando…</p>
      ) : notes.length === 0 ? (
        <p>Você não tem notificações.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`bg-gray-800 p-4 rounded-xl shadow-lg flex justify-between items-start ${
                n.isRead ? "opacity-50" : ""
              }`}
            >
              <div>
                <p className="mb-2">{n.message}</p>
                <p className="text-gray-400 text-sm">
                  {format(new Date(n.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Ver
                  </a>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-green-400 hover:underline"
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
