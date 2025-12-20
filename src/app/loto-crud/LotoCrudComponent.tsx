// src/app/loto-crud/LotoCrudComponent.tsx

"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";

// registra pt-BR
registerLocale("pt-BR", ptBR);

// util pra formatar “YYYY-MM-DD” → “DD/MM/YYYY”
function formatDateLocal(dateString: string): string {
  const [year, month, day] = dateString.split("-");
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
}: LotoCrudProps) {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      {/* Título */}
      <h1 className="text-3xl font-extrabold mb-6 text-center text-white bg-gradient-to-r from-green-700 via-gray-800 to-purple-700 py-4 rounded-xl shadow-lg">
        🎲 CRUD Loto (Lotofácil)
      </h1>

      {/* Atualizar banco */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onUpdateDb}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-white font-bold disabled:opacity-50"
        >
          🔄 Atualizar banco automaticamente
        </button>
      </div>

      {/* Mensagem */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded text-center font-semibold ${
            message.includes("✅")
              ? "bg-green-200 text-green-900"
              : "bg-red-200 text-red-900"
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSave} className="bg-gray-800 p-6 rounded-xl mb-10 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Data */}
          <div className="flex-1">
            <label className="block text-gray-300 mb-1">Data do Concurso</label>
            <DatePicker
              selected={startDate}
              onChange={onDateChange}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              className="w-full p-2 rounded bg-gray-900 text-gray-100 border border-gray-700"
              placeholderText="Selecione a data"
              disabled={loading}
            />
          </div>
          {/* Concurso */}
          <div className="flex-1">
            <label className="block text-gray-300 mb-1">Nº Concurso</label>
            <input
              type="number"
              name="concurso"
              value={form.concurso}
              onChange={onInputChange}
              placeholder="Ex: 3122"
              required
              disabled={loading || isEditing}
              className="w-full p-2 rounded bg-gray-900 text-gray-100 border border-gray-700"
            />
          </div>
        </div>

        {/* Dezenas */}
        <div className="mt-4">
          <label className="block text-gray-300 mb-1">Dezenas (qualquer formato)</label>
          <input
            type="text"
            name="dezenas"
            value={form.dezenas}
            onChange={onInputChange}
            placeholder="Ex: 1,2 03-04..."
            required
            disabled={loading}
            className={`w-full p-2 rounded bg-gray-900 text-gray-100 border ${
              errorDezenas ? "border-red-500" : "border-gray-700"
            }`}
          />
          {errorDezenas && (
            <div className="text-red-400 mt-1 font-medium">{errorDezenas}</div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-bold disabled:opacity-50"
          >
            {isEditing ? "Salvar Alteração" : "Adicionar"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full bg-gray-900 text-gray-100 border border-gray-800">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-3 text-left border-b border-gray-700">Data</th>
              <th className="p-3 text-left border-b border-gray-700">Concurso</th>
              <th className="p-3 text-left border-b border-gray-700">Dezenas</th>
              <th className="p-3 text-center border-b border-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  {loading ? "Carregando..." : "Nenhum registro encontrado."}
                </td>
              </tr>
            ) : (
              registros.map((reg, i) => (
                <tr key={reg.concurso} className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}>
                  <td className="p-3">{formatDateLocal(reg.data_concurso)}</td>
                  <td className="p-3">{reg.concurso}</td>
                  <td className="p-3 font-mono text-sm whitespace-pre-wrap">{reg.dezenas}</td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button onClick={() => onEdit(reg)} disabled={loading} title="Editar" className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg font-bold disabled:opacity-50">
                      ✏️
                    </button>
                    <button onClick={() => onDelete(reg.concurso)} disabled={loading} title="Excluir" className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg font-bold disabled:opacity-50">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
