/* =============================================================================
 * ARQUIVO: src/app/loto-crud/LotoCrudComponent.tsx
 * REFATORAÇÃO: Suporte a IntersectionObserver para carregamento dinâmico.
 * ============================================================================= */

"use client";

import React, { useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

function formatDateLocal(dateString: string): string {
  if (!dateString) return "-";
  const base = dateString.split("T")[0].split(" ")[0];
  const parts = base.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export type LotoCrudProps = {
  loading: boolean;
  message: string;
  registros: any[];
  form: { data_concurso: string; concurso: string; dezenas: string };
  startDate: Date | null;
  isEditing: boolean;
  errorDezenas: string;
  onDateChange: (d: Date | null) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  onEdit: (reg: any) => void;
  onDelete: (c: number) => void;
  onUpdateDb: () => void;
  onCancelEdit: () => void;
  hasMore: boolean;      // Nova prop
  onLoadMore: () => void; // Nova prop
};

export default function LotoCrudComponent({
  loading,
  message,
  registros,
  form,
  startDate,
  isEditing,
  errorDezenas,
  onDateChange,
  onInputChange,
  onSave,
  onEdit,
  onDelete,
  onUpdateDb,
  onCancelEdit,
  hasMore,
  onLoadMore,
}: LotoCrudProps) {
  
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* INTERSECTION OBSERVER: Detecta fim da tabela e chama carregamento */
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    }, { threshold: 0.1 });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 text-gray-100">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-white bg-gradient-to-r from-green-700 via-gray-800 to-purple-700 py-4 rounded-xl shadow-lg border border-gray-700">
        🎲 CRUD Loto (Paginado)
      </h1>

      {/* Botão de atualização */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onUpdateDb}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-white font-bold disabled:opacity-50 transition-all"
        >
          {loading ? "Processando..." : "🔄 Atualizar banco automaticamente"}
        </button>
      </div>

      {/* Mensagens de Feedback */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-center font-bold ${
          message.includes("✅") ? "bg-green-600/20 text-green-400 border border-green-600" : "bg-red-600/20 text-red-400 border border-red-600"
        }`}>
          {message}
        </div>
      )}

      {/* Formulário de Cadastro/Edição */}
      <form onSubmit={onSave} className="bg-gray-800 p-6 rounded-xl mb-10 border border-gray-700 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Data do Concurso</label>
            <DatePicker
              selected={startDate}
              onChange={onDateChange}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              className="w-full p-2.5 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:border-blue-500 outline-none"
              placeholderText="Selecione a data"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Nº Concurso</label>
            <input
              type="number"
              name="concurso"
              value={form.concurso}
              onChange={onInputChange}
              placeholder="Ex: 3122"
              required
              disabled={loading || isEditing}
              className="w-full p-2.5 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-bold text-gray-400 mb-2">Dezenas (Sequência de 15)</label>
          <input
            type="text"
            name="dezenas"
            value={form.dezenas}
            onChange={onInputChange}
            placeholder="Ex: 01,02,03..."
            required
            disabled={loading}
            className={`w-full p-2.5 rounded bg-gray-900 text-gray-100 font-mono tracking-widest border transition-colors ${
              errorDezenas ? "border-red-500" : "border-gray-700 focus:border-blue-500"
            }`}
          />
          {errorDezenas && <div className="text-red-400 mt-2 text-xs font-bold uppercase">{errorDezenas}</div>}
        </div>

        <div className="flex gap-4 mt-8">
          <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white font-black disabled:opacity-50 transition-all uppercase tracking-wider">
            {isEditing ? "Confirmar Alteração" : "Adicionar Concurso"}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancelEdit} disabled={loading} className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-bold transition-all">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabela de Registros com Scroll Infinito */}
      <div className="overflow-hidden rounded-xl border border-gray-800 shadow-2xl bg-gray-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
              <th className="p-4 border-b border-gray-800">Data</th>
              <th className="p-4 border-b border-gray-800">Nº</th>
              <th className="p-4 border-b border-gray-800 text-center">Dezenas</th>
              <th className="p-4 border-b border-gray-800 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500 italic">
                  {loading ? "Carregando registros..." : "Nenhum sorteio encontrado."}
                </td>
              </tr>
            ) : (
              registros.map((reg, i) => (
                <tr key={reg.concurso} className={`hover:bg-blue-900/10 transition-colors border-b border-gray-800/50 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"}`}>
                  <td className="p-4 font-medium">{formatDateLocal(reg.data_concurso)}</td>
                  <td className="p-4"><span className="bg-gray-800 px-2 py-1 rounded text-blue-400 font-bold">{reg.concurso}</span></td>
                  <td className="p-4 font-mono text-sm text-purple-300 text-center">{reg.dezenas}</td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    <button onClick={() => onEdit(reg)} disabled={loading} className="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black p-2 rounded-lg transition-all">✏️</button>
                    <button onClick={() => onDelete(reg.concurso)} disabled={loading} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ELEMENTO GATILHO PARA CARREGAMENTO */}
        <div ref={loaderRef} className="p-8 flex justify-center items-center">
          {loading && hasMore && (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-blue-300">Carregando mais...</span>
            </div>
          )}
          {!hasMore && registros.length > 0 && (
            <span className="text-gray-500 text-sm italic">Fim da lista.</span>
          )}
        </div>
      </div>
    </main>
  );
}