// src/app/minha-conta/assinaturas/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

type Subscription = {
  id: number;
  plano: "FREE" | "BASICO" | "PLUS" | "PREMIO";
  status: "ACTIVE" | "CANCELED" | "PAST_DUE";
  startedAt: string;
  expiresAt: string;
};

const PLANOS = [
  { value: "BASICO", label: "Básico" },
  { value: "PLUS", label: "Plus" },
  { value: "PREMIO", label: "Prêmio" },
];

export default function AssinaturasPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoPlano, setNovoPlano] = useState("BASICO");
  const [novaValidade, setNovaValidade] = useState("");

  // carrega assinaturas
  const loadSubs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/subscriptions", {
        credentials: "include",
      });
      const data = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubs();
  }, []);

  // criar/atualizar assinatura
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaValidade) {
      alert("Escolha data de expiração");
      return;
    }
    await fetch("/api/auth/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        plano: novoPlano,
        expiresAt: new Date(novaValidade).toISOString(),
      }),
    });
    setNovaValidade("");
    loadSubs();
  };

  // cancelar assinatura ativa
  const handleCancel = async (id: number) => {
    if (!confirm("Deseja cancelar esta assinatura?")) return;
    await fetch(`/api/auth/subscriptions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadSubs();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Assinaturas</h1>

      {loading ? (
        <p>Carregando…</p>
      ) : subs.length === 0 ? (
        <p>
          Você está no plano <strong>FREE</strong>.
        </p>
      ) : (
        subs.map((sub) => (
          <div
            key={sub.id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-2 mb-6"
          >
            <p>
              <strong>Plano:</strong> {sub.plano.toLowerCase()}
            </p>
            <p>
              <strong>Status:</strong> {sub.status.toLowerCase()}
            </p>
            <p>
              <strong>Início:</strong>{" "}
              {format(new Date(sub.startedAt), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
            <p>
              <strong>Validade até:</strong>{" "}
              {format(new Date(sub.expiresAt), "dd/MM/yyyy", {
                locale: ptBR,
              })}
            </p>
            {sub.status === "ACTIVE" && (
              <button
                onClick={() => handleCancel(sub.id)}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            )}
          </div>
        ))
      )}

      <form
        onSubmit={handleCreate}
        className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 max-w-md"
      >
        <h2 className="font-semibold text-lg">Contratar/Recontratar Plano</h2>
        <div>
          <label className="block mb-1">Plano</label>
          <select
            value={novoPlano}
            onChange={(e) => setNovoPlano(e.target.value)}
            className="w-full p-2 rounded bg-gray-900"
          >
            {PLANOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Validade até</label>
          <input
            type="date"
            value={novaValidade}
            onChange={(e) => setNovaValidade(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-900"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Confirmar
        </button>
      </form>
    </>
  );
}
