"use client";

import React, { useEffect, useState, useCallback } from "react";

interface AdminProps {
  adminEmails: string[];
}

/**
 * Heurística H1: Visibilidade do status do sistema (Real-time traffic).
 * Heurística H8: Design Minimalista e Legível (Fontes text-sm e text-base).
 */
export default function AdminDashboardClient({ adminEmails }: AdminProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]); // CORRIGIDO: Nome único para evitar ReferenceError
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState({ msg: "", type: "" });

  const notify = (msg: string, type: "success" | "error") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback({ msg: "", type: "" }), 5000);
  };

  const syncData = useCallback(async () => {
    try {
      const [resStats, resUsers, resPending] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/pending").then(r => r.json())
      ]);

      setStats(resStats);
      setUsers(Array.isArray(resUsers) ? resUsers : []);
      setPedidos(Array.isArray(resPending) ? resPending : []);
    } catch (error) {
      notify("Falha na sincronização com a VPS", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 15000); // 15s para tráfego real
    return () => clearInterval(interval);
  }, [syncData]);

  const handleUpdateLoto = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/loto/atualizar", { method: "POST" });
      if (res.ok) {
        notify("Banco Lotofácil atualizado com sucesso!", "success");
        syncData();
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (userId: number, acao: 'aprovar' | 'rejeitar') => {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, acao })
      });
      if (res.ok) {
        notify(`Pedido ${acao === 'aprovar' ? 'aprovado' : 'removido'}`, "success");
        syncData();
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-orange-500 font-mono animate-pulse text-base uppercase">Sincronizando_Dados...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Feedbacks Flutuantes */}
      {feedback.msg && (
        <div className={`fixed top-8 right-8 z-50 p-6 border-l-4 shadow-2xl font-bold text-sm uppercase tracking-widest ${
          feedback.type === "success" ? "bg-green-950 border-green-500 text-green-400" : "bg-red-950 border-red-500 text-red-400"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Banco de Dados */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-xl">
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-4">Base Lotofácil</p>
          <div className="flex justify-between items-end">
            <h2 className="text-5xl font-mono text-white font-black">{stats?.dbStats?.totalJogos}</h2>
            <div className="text-right text-[11px] text-slate-500 uppercase font-bold leading-tight">
              <p>Último Concurso</p>
              <p className="text-slate-300">{stats?.dbStats?.ultimaData}</p>
            </div>
          </div>
          <button 
            onClick={handleUpdateLoto}
            disabled={processing}
            className="w-full mt-8 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded uppercase tracking-[0.2em] transition-all disabled:opacity-30"
          >
            {processing ? "Processando..." : "Sincronizar Banco"}
          </button>
        </div>

        {/* Card Usuários */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-xl">
          <p className="text-green-500 text-xs font-black uppercase tracking-widest mb-4">Membros Ativos</p>
          <h2 className="text-5xl font-mono text-white font-black">{stats?.userStats?.total}</h2>
          <div className="mt-6 flex gap-6 text-xs font-bold uppercase">
            <span className="text-purple-400">Premium: {stats?.userStats?.premium}</span>
            <span className="text-slate-500">Free: {stats?.userStats?.free}</span>
          </div>
        </div>

        {/* Card Tráfego Online (IPs e E-mails) */}
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-xl">
          <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4">Acessos Agora</p>
          <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {stats?.onlineDetails?.map((online: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-mono border-b border-slate-800/50 pb-2">
                <div className="flex flex-col">
                  <span className={online.role === 'admin' ? "text-green-400 font-bold" : "text-slate-300"}>
                    {online.id} {online.role === 'admin' && "🛡️"}
                  </span>
                  <span className="text-[9px] text-slate-600">{online.ip}</span>
                </div>
                <span className="text-blue-500/50">{online.time}</span>
              </div>
            ))}
            {(!stats?.onlineDetails || stats.onlineDetails.length === 0) && (
              <p className="text-slate-700 italic text-[11px] text-center py-4">Aguardando conexões...</p>
            )}
          </div>
        </div>
      </div>

      {/* Solicitações de Assinatura */}
      <section className="bg-[#0f172a] border border-slate-800 p-6 rounded-xl">
        <h3 className="text-orange-500 text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
           <span className="h-3 w-3 rounded-full bg-orange-500 animate-pulse"></span> Pedidos Pendentes ({pedidos.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col gap-4 shadow-inner">
              <div className="font-mono">
                <p className="text-sm text-white font-black truncate">{p.email}</p>
                <p className="text-[11px] text-orange-500 uppercase mt-1 font-bold">Solicitou: {p.plano_solicitado}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(p.id, 'aprovar')} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded uppercase transition-all">Aprovar</button>
                <button onClick={() => handleAction(p.id, 'rejeitar')} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded uppercase transition-all">Rejeitar</button>
              </div>
            </div>
          ))}
          {pedidos.length === 0 && <p className="text-slate-600 italic text-sm py-2 font-mono">Sem pendências no momento.</p>}
        </div>
      </section>

      {/* Tabela Geral de Membros */}
      <section className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-orange-500 text-sm font-black uppercase tracking-widest">Lista de Usuários</h3>
          <button onClick={syncData} className="text-xs text-blue-400 hover:text-blue-200 font-bold uppercase tracking-widest">⟳ Atualizar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-slate-900 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="p-6">Identificação</th>
                <th className="p-6">Plano Atual</th>
                <th className="p-6">Expiração</th>
                <th className="p-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-900/10 transition-colors">
                  <td className="p-6 text-slate-200 font-bold">
                    <div className="flex items-center gap-3">
                      <span>{u.email}</span>
                      {adminEmails.includes(u.email) && <span className="text-orange-500 text-lg">🛡️</span>}
                    </div>
                  </td>
                  <td className={`p-6 font-black uppercase ${u.subscriptions?.[0]?.plano === 'PREMIO' ? 'text-green-500' : 'text-slate-600'}`}>
                    {u.subscriptions?.[0]?.plano || "FREE"}
                  </td>
                  <td className="p-6 text-slate-400 font-bold">
                    {u.subscriptions?.[0]?.expiresAt ? new Date(u.subscriptions[0].expiresAt).toLocaleDateString() : "---"}
                  </td>
                  <td className="p-6 text-center">
                    {!adminEmails.includes(u.email) && (
                      <button 
                        onClick={() => fetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId: u.id, novoPlano: u.subscriptions?.[0]?.plano === "PREMIO" ? "FREE" : "PREMIO" }) }).then(() => syncData())}
                        className="px-5 py-2 border-2 border-slate-700 hover:border-orange-500 text-xs text-slate-400 hover:text-orange-500 rounded-md font-black transition-all uppercase"
                      >
                        Alternar Nível
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}