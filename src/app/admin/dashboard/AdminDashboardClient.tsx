"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Shield, Zap, Users as UsersIcon } from "lucide-react";

interface AdminProps {
  adminEmails: string[];
}

export default function AdminDashboardClient({ adminEmails }: AdminProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
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
    const interval = setInterval(syncData, 15000); 
    return () => clearInterval(interval);
  }, [syncData]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <div className="text-orange-500 font-mono animate-pulse text-sm uppercase tracking-[0.3em]">
        Sincronizando_Dados_vps...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 text-slate-300 font-sans selection:bg-orange-500/30">
      {feedback.msg && (
        <div className={`fixed top-8 right-8 z-50 p-6 border-l-4 shadow-2xl font-bold text-xs uppercase tracking-widest animate-in slide-in-from-right ${
          feedback.type === "success" ? "bg-green-950/90 border-green-500 text-green-400" : "bg-red-950/90 border-red-500 text-red-400"
        }`}>
          {feedback.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* GRID DE CARDS SUPERIORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD LOTOFÁCIL */}
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={80} className="text-orange-500" />
            </div>
            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] mb-4">Base Lotofácil</p>
            <div className="flex justify-between items-end">
              <h2 className="text-5xl font-mono text-white font-black leading-none">{stats?.dbStats?.totalJogos}</h2>
              <div className="text-right text-[10px] text-slate-500 uppercase font-bold">
                <p>Último Sorteio</p>
                <p className="text-slate-300 mt-1 font-mono">{stats?.dbStats?.ultimaData}</p>
              </div>
            </div>
          </div>

          {/* CARD USUÁRIOS */}
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl">
            <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.25em] mb-4">Membros Ativos</p>
            <h2 className="text-5xl font-mono text-white font-black leading-none">{stats?.userStats?.total}</h2>
            <div className="mt-6 flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded">PREMIUM: {stats?.userStats?.premium}</span>
              <span className="text-slate-500 bg-slate-500/10 px-2 py-1 rounded">FREE: {stats?.userStats?.free}</span>
            </div>
          </div>

          {/* CARD TRÁFEGO REAL (Acessos Agora) */}
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-2xl flex flex-col">
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-4">Acessos Agora</p>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
              {stats?.onlineDetails?.map((online: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-[10px] font-mono border-b border-slate-800/50 pb-2">
                  <div className="flex flex-col">
                    <span className={online.role === 'admin' ? "text-orange-400 font-bold" : "text-slate-300"}>
                      {online.id} {online.role === 'admin' && "🛡️"}
                    </span>
                    <span className="text-[9px] text-slate-600 italic">{online.ip}</span>
                  </div>
                  <span className="text-slate-500 text-[9px]">{online.time}</span>
                </div>
              ))}
              {(!stats?.onlineDetails || stats.onlineDetails.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center py-4">
                  <span className="text-slate-700 italic text-[11px] animate-pulse">Aguardando conexões...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LISTA DE USUÁRIOS */}
        <section className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <UsersIcon size={14} className="text-orange-500" /> Gerenciamento de Membros
            </h3>
            <button onClick={syncData} className="text-[10px] text-blue-400 hover:text-white font-bold uppercase transition-colors flex items-center gap-2">
              <RefreshCw size={12} /> Sincronizar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/50 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="p-6">Usuário</th>
                  <th className="p-6">Plano</th>
                  <th className="p-6">Expiração</th>
                  <th className="p-6 text-center">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-200 font-bold">{u.email}</span>
                        {adminEmails.includes(u.email) && <Shield size={12} className="text-orange-500" />}
                      </div>
                    </td>
                    <td className={`p-6 font-black uppercase tracking-tighter ${u.subscriptions?.[0]?.plano === 'PREMIO' ? 'text-green-500' : 'text-slate-600'}`}>
                      {u.subscriptions?.[0]?.plano || "FREE"}
                    </td>
                    <td className="p-6 text-slate-500 font-bold italic">
                      {u.subscriptions?.[0]?.expiresAt ? new Date(u.subscriptions[0].expiresAt).toLocaleDateString() : "---"}
                    </td>
                    <td className="p-6 text-center">
                      {!adminEmails.includes(u.email) && (
                        <button 
                          onClick={() => fetch("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId: u.id, novoPlano: u.subscriptions?.[0]?.plano === "PREMIO" ? "FREE" : "PREMIO" }) }).then(() => syncData())}
                          className="px-4 py-2 border border-slate-700 hover:border-orange-500 text-[9px] text-slate-500 hover:text-white rounded uppercase font-black transition-all"
                        >
                          Trocar Nível
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
    </div>
  );
}