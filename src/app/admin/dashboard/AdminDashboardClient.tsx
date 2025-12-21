"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  RefreshCcw, Check, X, Users, Activity, 
  Database, Zap, Edit3, Globe, Shield 
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { PLANOS_CONFIG } from "@/utils/constants"; // Fonte Única de Verdade

/**
 * DASHBOARD ADMINISTRATIVO - NÚCLEO DE OPERAÇÕES (PRODUÇÃO)
 * Resolve: Erro 500 (Sync por Lotes), Monitoramento por Nível, Auditoria PIX.
 */
export default function AdminDashboardClient({ statsIniciais }: any) {
  const { addNotification } = useNotifications();
  
  // --- ESTADOS DE DADOS ---
  const [stats, setStats] = useState<any>(statsIniciais);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [membros, setMembros] = useState<any[]>([]);
  
  // --- ESTADOS DE INTERFACE ---
  const [sincronizando, setSincronizando] = useState(false);
  const [faltantes, setFaltantes] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  
  // --- ESTADOS DE EDIÇÃO MANUAL ---
  const [editandoUser, setEditandoUser] = useState<any>(null);
  const [novoPlano, setNovoPlano] = useState("BASICO");
  const [novaData, setNovaData] = useState("");

  /**
   * Coleta dados administrativos via Promise.all (H7)
   */
  const carregarDados = useCallback(async () => {
    try {
      const [resStats, resPedidos, resMembros] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/pending"),
        fetch("/api/admin/users")
      ]);
      
      const [dataStats, dataPedidos, dataMembros] = await Promise.all([
        resStats.json(),
        resPedidos.json(),
        resMembros.json()
      ]);

      if (resStats.ok) setStats(dataStats);
      if (Array.isArray(dataPedidos)) setPedidos(dataPedidos);
      if (Array.isArray(dataMembros)) setMembros(dataMembros);
      
      if (resStats.status === 403) {
        addNotification({ 
          type: "error", 
          title: "ACESSO NEGADO", 
          message: "Credenciais insuficientes no servidor." 
        });
      }
    } catch (e) {
      console.error("[ADMIN] Falha na carga de dados:", e);
    } finally { setCarregando(false); }
  }, [addNotification]);

  useEffect(() => { 
    carregarDados(); 
    const intervalo = setInterval(carregarDados, 20000); // Auto-refresh 20s
    return () => clearInterval(intervalo);
  }, [carregarDados]);

  /**
   * SOLUÇÃO ERRO 500: Sincronização Recursiva Gerenciada por Lotes
   */
  const handleSincronizarBanco = async () => {
    if (sincronizando) return;
    setSincronizando(true);
    setFaltantes(null);

    try {
      let emProgresso = true;
      while (emProgresso) {
        const res = await fetch("/api/loto/atualizar", { method: "POST" });
        if (!res.ok) throw new Error("Falha ao processar lote na API.");

        const dados = await res.json();
        setFaltantes(dados.faltantes);

        // Condição de parada: Zero concursos faltantes
        if (!dados.faltantes || dados.faltantes === 0) {
          emProgresso = false;
          addNotification({ 
            type: "success", 
            title: "SINCRONIA CONCLUÍDA", 
            message: "Resultados Lotofácil integrados ao banco unificado." 
          });
          carregarDados();
        } else {
          // Delay técnico para evitar Rate Limit por IP (H6)
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    } catch (e: any) {
      addNotification({ 
        type: "error", 
        title: "FALHA NA SYNC", 
        message: e.message 
      });
    } finally { 
      setSincronizando(false); 
      setFaltantes(null);
    }
  };

  const handleAprovarPedido = async (userId: number, acao: 'aprovar' | 'rejeitar') => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      body: JSON.stringify({ userId, acao })
    });
    if (res.ok) {
      addNotification({ 
        type: "success", 
        title: "AUDITORIA", 
        message: acao === 'aprovar' ? "Plano ativado com sucesso." : "Solicitação rejeitada." 
      });
      carregarDados();
    }
  };

  const handleUpdateManual = async () => {
    if (!editandoUser || !novaData) return;
    try {
      const res = await fetch(`/api/admin/users/${editandoUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({ plano: novoPlano, expiresAt: novaData })
      });
      if (res.ok) {
        addNotification({ 
          type: "success", 
          title: "SISTEMA", 
          message: "Nível alterado manualmente." 
        });
        setEditandoUser(null);
        carregarDados();
      }
    } catch (e) { 
      addNotification({ type: "error", title: "ERRO", message: "Falha na persistência." }); 
    }
  };

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <span className="text-orange-500 text-3xl font-black italic">{">_"}</span>
          <h1 className="text-2xl font-black text-orange-500 tracking-[0.2em] uppercase italic">
            Gerenciamento de Sistema
          </h1>
        </div>
        
        <button 
          onClick={handleSincronizarBanco}
          disabled={sincronizando}
          className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50"
        >
          <RefreshCcw size={18} className={sincronizando ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
          {sincronizando ? `SINCRONIZANDO (${faltantes ?? "..."})` : "Sincronizar Banco de Dados"}
        </button>
      </div>

      {/* MONITORAMENTO TÉCNICO (RESTAURADO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARD BASE DE DADOS */}
        <div className="bg-[#0b1120] p-8 border-2 border-slate-800 rounded-[2.5rem] relative overflow-hidden group">
          <Zap className="absolute right-6 top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" size={48} />
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Base Lotofácil</p>
          <div className="text-6xl font-black text-white italic tracking-tighter">
            {stats?.totalJogos || "--"}
          </div>
          <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Sincronia VPS OK
          </p>
        </div>

        {/* CARD MEMBROS COM DISTRIBUIÇÃO POR NÍVEL */}
        <div className="bg-[#0b1120] p-8 border-2 border-slate-800 rounded-[2.5rem] relative overflow-hidden">
          <Users className="absolute right-6 top-6 text-green-500/10" size={48} />
          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Membros Ativos</p>
          <div className="text-6xl font-black text-white italic tracking-tighter">
            {stats?.membrosAtivos || 0}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {PLANOS_CONFIG.map((p: any) => (
              <span key={p.id} className={`text-[9px] font-black px-2 py-1 rounded border ${p.border} ${p.cor} bg-slate-900/50`}>
                {p.id}: {stats?.contagemPlanos?.[p.id] || 0}
              </span>
            ))}
          </div>
        </div>

        {/* MONITOR DE TRÁFEGO IP */}
        <div className="bg-[#0b1120] p-8 border-2 border-slate-800 rounded-[2.5rem] relative overflow-hidden">
          <Globe className="absolute right-6 top-6 text-cyan-500/10" size={48} />
          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Acessos Agora (IP)</p>
          <div className="space-y-4 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            {stats?.acessosAgora?.length > 0 ? stats.acessosAgora.map((acesso: any, i: number) => (
              <div key={i} className="flex flex-col gap-1 border-l-2 border-cyan-500/30 pl-3">
                <span className="text-[11px] font-black text-white truncate italic">{acesso.email || 'Visitante'}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{acesso.ip} • Online agora</span>
              </div>
            )) : <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest py-4">Sem acessos ativos</p>}
          </div>
        </div>
      </div>

      {/* AUDITORIA DE SOLICITAÇÕES PIX */}
      <div className="bg-[#0b1120] border-2 border-orange-500/40 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(249,115,22,0.1)]">
        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 italic mb-8">
          <Database className="text-orange-500" size={20} /> Solicitações Pendentes
        </h2>

        {pedidos.length === 0 ? (
          <p className="text-[10px] font-black text-slate-700 uppercase text-center py-6 border-2 border-dashed border-slate-900 rounded-3xl tracking-widest">Nenhuma solicitação aguardando auditoria</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pedidos.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-slate-800 hover:border-orange-500/30 transition-all">
                <div className="space-y-1">
                  <span className="text-xs font-black text-white block italic">{p.email}</span>
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Upgrade: {p.plano_solicitado}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAprovarPedido(p.id, 'aprovar')} className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl hover:bg-green-500 hover:text-black transition-all shadow-lg"><Check size={20} /></button>
                  <button onClick={() => handleAprovarPedido(p.id, 'rejeitar')} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABELA DE GESTÃO DE MEMBROS (ALTA DENSIDADE) */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-900/10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
            <Users size={16} className="text-cyan-500" /> Auditoria de Membros Cadastrados
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-900/30">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vigência</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {membros.map((m: any) => {
                const configPlano = PLANOS_CONFIG.find((p: any) => p.id === (m.subscriptions?.[0]?.plano || "FREE"));
                return (
                  <tr key={m.id} className="hover:bg-slate-900/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white italic">{m.name || "---"}</span>
                        <span className="text-[10px] text-slate-500 font-bold">{m.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black px-3 py-1 rounded border uppercase ${configPlano?.border} ${configPlano?.cor}`}>
                        {configPlano?.nome || "FREE"}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-400 uppercase tracking-tight">
                      {m.subscriptions?.[0]?.expiresAt ? new Date(m.subscriptions[0].expiresAt).toLocaleDateString('pt-BR') : "VITALÍCIO"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => { setEditandoUser(m); setNovaData(m.subscriptions?.[0]?.expiresAt?.split('T')[0] || ""); }}
                        className="text-[9px] font-black bg-slate-900 border border-slate-800 hover:bg-cyan-500 hover:text-black px-5 py-2.5 rounded-xl uppercase transition-all inline-flex items-center gap-2 italic"
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE INTERVENÇÃO MANUAL */}
      {editandoUser && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#020617] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xs font-black text-cyan-400 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3">
              <Shield size={16} /> Intervenção Admin
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Selecionar Nível</label>
                <select 
                  value={novoPlano} onChange={(e) => setNovoPlano(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                >
                  {PLANOS_CONFIG.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Expiração</label>
                <input 
                  type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white uppercase outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <button onClick={() => setEditandoUser(null)} className="py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500">Sair</button>
                <button onClick={handleUpdateManual} className="py-4 bg-cyan-600 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-cyan-500 italic">Aplicar_</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}