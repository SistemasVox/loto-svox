/* =============================================================================
 * ARQUIVO: src/app/loto-crud/page.tsx
 * REFATORAÇÃO: Implementação de Paginação (20 por vez) e Infinite Scroll.
 * ============================================================================= */

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import LotoCrudComponent, { LotoCrudProps } from "./LotoCrudComponent";

const LIMIT = 20;

const fetchJson = (url: string, opts: RequestInit = {}) =>
  fetch(url, { credentials: "include", ...opts }).then((r) => r.json());

async function fetchSession() { return fetchJson("/api/auth/session"); }
async function fetchLotoRecords(page: number) { 
  return fetchJson(`/api/loto?page=${page}&limit=${LIMIT}`); 
}
async function createLotoRecord(data: any) {
  return fetchJson("/api/loto", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
async function updateLotoRecord(data: any) {
  return fetchJson("/api/loto", {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
async function deleteLotoRecord(concurso: number) {
  return fetchJson("/api/loto", {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concurso }),
  });
}
async function updateExternalDb() {
  return fetchJson("/api/loto/atualizar", { method: "POST" });
}

function parseDateLocal(ds: string): Date {
  const [y, m, d] = ds.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

export default function LotoCrudPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Estados CRUD ---  
  const [registros, setRegistros] = useState<any[]>([]);
  const [form, setForm] = useState({ data_concurso: "", concurso: "", dezenas: "" });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDezenas, setErrorDezenas] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Estados Paginação ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);

  // Auth Guard
  useEffect(() => {
    fetchSession()
      .then((data) => {
        if (!data.user) return router.replace("/login");
        if (data.user.role !== "admin") return router.replace("/");
        setUser(data.user);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setAuthLoading(false));
  }, [router]);

  /* CARREGAMENTO PAGINADO: Estabilizado via useCallback */
  const loadMore = useCallback(async (pageToFetch: number, reset: boolean = false) => {
    if (isFetching.current || (!hasMore && !reset)) return;
    
    isFetching.current = true;
    setLoading(true);
    try {
      const data = await fetchLotoRecords(pageToFetch);
      if (Array.isArray(data)) {
        setRegistros(prev => reset ? data : [...prev, ...data]);
        setHasMore(data.length === LIMIT);
      }
    } catch (err) {
      setMessage("❌ Erro ao carregar registros");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [hasMore]);

  // Efeito inicial
  useEffect(() => {
    if (!authLoading && user) {
      loadMore(1, true);
    }
  }, [authLoading, user, loadMore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "dezenas") {
      const nums = value.replace(/\D/g, "");
      const pairs = nums.match(/.{1,2}/g) || [];
      if (pairs.length > 15) {
        setErrorDezenas("Só são permitidas 15 dezenas!");
        return;
      }
      setErrorDezenas("");
      setForm({ ...form, dezenas: pairs.map((n) => n.padStart(2, "0")).join(",") });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      setForm({ ...form, data_concurso: `${y}-${m}-${d}` });
    } else {
      setForm({ ...form, data_concurso: "" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pairs = form.dezenas.replace(/\D/g, "").match(/.{1,2}/g) || [];
    if (pairs.length !== 15) {
      setErrorDezenas("Preencha exatamente 15 dezenas.");
      return;
    }
    setLoading(true);

    const fn = isEditing ? updateLotoRecord : createLotoRecord;
    const res = await fn(form).catch(() => ({ error: true }));

    setMessage(res.error ? "❌ Falha ao salvar" : isEditing ? "✅ Atualizado!" : "✅ Criado!");
    if (!res.error) {
      setForm({ data_concurso: "", concurso: "", dezenas: "" });
      setStartDate(null);
      setIsEditing(false);
      // Resetar para página 1 após salvar para refletir mudanças
      setPage(1);
      loadMore(1, true);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (reg: any) => {
    const cleanDate = reg.data_concurso.split("T")[0];
    setForm({ data_concurso: cleanDate, concurso: String(reg.concurso), dezenas: reg.dezenas });
    setStartDate(parseDateLocal(cleanDate));
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (concurso: number) => {
    if (!confirm("Confirma exclusão?")) return;
    setLoading(true);
    const res = await deleteLotoRecord(concurso).catch(() => ({ error: true }));
    setMessage(res.error ? "❌ Falha ao excluir" : "✅ Excluído!");
    if (!res.error) {
      setPage(1);
      loadMore(1, true);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdateDb = async () => {
    setLoading(true);
    const res = await updateExternalDb().catch(() => ({ error: true }));
    setMessage(res.error ? "❌ Erro ao atualizar banco" : `✅ ${res.mensagem}`);
    if (!res.error) {
      setPage(1);
      loadMore(1, true);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleCancelEdit = () => {
    setForm({ data_concurso: "", concurso: "", dezenas: "" });
    setStartDate(null);
    setIsEditing(false);
  };

  /* HANDLER DO SCROLL: Acionado pelo componente de apresentação */
  const handleScrollThreshold = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMore(nextPage);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen bg-black text-white">Carregando…</div>;
  if (!user) return null;

  return (
    <LotoCrudComponent 
      loading={loading}
      message={message}
      registros={registros}
      form={form}
      startDate={startDate}
      isEditing={isEditing}
      errorDezenas={errorDezenas}
      onDateChange={handleDateChange}
      onInputChange={handleInputChange}
      onSave={handleSave}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onUpdateDb={handleUpdateDb}
      onCancelEdit={handleCancelEdit}
      hasMore={hasMore}
      onLoadMore={handleScrollThreshold}
    />
  );
}