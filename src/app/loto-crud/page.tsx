// src/app/loto-crud/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LotoCrudComponent, { LotoCrudProps } from "./LotoCrudComponent";

// ——— Service functions inline ———
const fetchJson = (url: string, opts: RequestInit = {}) =>
  fetch(url, { credentials: "include", ...opts }).then((r) => r.json());

async function fetchSession() {
  return fetchJson("/api/auth/session");
}
async function fetchLotoRecords() {
  return fetchJson("/api/loto");
}
async function createLotoRecord(data: any) {
  return fetchJson("/api/loto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
async function updateLotoRecord(data: any) {
  return fetchJson("/api/loto", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
async function deleteLotoRecord(concurso: number) {
  return fetchJson("/api/loto", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concurso }),
  });
}
async function updateExternalDb() {
  return fetchJson("/api/loto/atualizar", { method: "POST" });
}

// util pra converter “YYYY-MM-DD” → Date
function parseDateLocal(ds: string): Date {
  const [y, m, d] = ds.split("-").map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d);
}

export default function LotoCrudPage() {
  const router = useRouter();

  // — Auth guard —  
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // — Estados CRUD —  
  const [registros, setRegistros] = useState<any[]>([]);
  const [form, setForm] = useState({ data_concurso: "", concurso: "", dezenas: "" });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDezenas, setErrorDezenas] = useState("");
  const [loading, setLoading] = useState(false);

  // carrega registros após auth
  useEffect(() => {
    if (!authLoading && user) {
      fetchLotoRecords().then(setRegistros).catch(() => setMessage("❌ Erro ao carregar registros"));
    }
  }, [authLoading, user]);

  // handlers
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
    setForm({ ...form, data_concurso: date ? date.toISOString().slice(0, 10) : "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const pairs = form.dezenas.replace(/\D/g, "").match(/.{1,2}/g) || [];
    if (pairs.length !== 15) {
      setErrorDezenas("Preencha exatamente 15 dezenas.");
      return;
    }
    setErrorDezenas("");
    setLoading(true);

    const fn = isEditing ? updateLotoRecord : createLotoRecord;
    const payload = { ...form, dezenas: pairs.join(",") };
    const res = await fn(payload).catch(() => ({ error: true }));

    setMessage(res.error ? "❌ Falha ao salvar" : isEditing ? "✅ Atualizado!" : "✅ Criado!");
    if (!res.error) {
      setForm({ data_concurso: "", concurso: "", dezenas: "" });
      setStartDate(null);
      setIsEditing(false);
      fetchLotoRecords().then(setRegistros);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (reg: any) => {
    setForm({ data_concurso: reg.data_concurso.slice(0, 10), concurso: String(reg.concurso), dezenas: reg.dezenas });
    setStartDate(parseDateLocal(reg.data_concurso));
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (concurso: number) => {
    if (!confirm("Confirma exclusão?")) return;
    setLoading(true);
    const res = await deleteLotoRecord(concurso).catch(() => ({ error: true }));
    setMessage(res.error ? "❌ Falha ao excluir" : "✅ Excluído!");
    if (!res.error) fetchLotoRecords().then(setRegistros);
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdateDb = async () => {
    setLoading(true);
    const res = await updateExternalDb().catch(() => ({ error: true }));
    setMessage(res.error ? "❌ Erro ao atualizar banco" : `✅ ${res.mensagem}`);
    if (!res.error) fetchLotoRecords().then(setRegistros);
    setLoading(false);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleCancelEdit = () => {
    setForm({ data_concurso: "", concurso: "", dezenas: "" });
    setStartDate(null);
    setIsEditing(false);
    setErrorDezenas("");
  };

  // guard render
  if (authLoading) return <div className="flex items-center justify-center h-screen">Carregando…</div>;
  if (!user) return null;

  // props pro componente de apresentação
  const props: LotoCrudProps = {
    loading,
    message,
    registros,
    form,
    startDate,
    isEditing,
    errorDezenas,
    onDateChange: handleDateChange,
    onInputChange: handleInputChange,
    onSave: handleSave,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onUpdateDb: handleUpdateDb,
    onCancelEdit: handleCancelEdit,
  };

  return <LotoCrudComponent {...props} />;
}
