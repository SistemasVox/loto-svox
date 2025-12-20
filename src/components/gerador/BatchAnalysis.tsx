// src/components/gerador/BatchAnalysis.tsx
import { analisarLote } from '@/utils/gameAnalysis';
import { GeneratedGame } from '@/types/generator';

export default function BatchAnalysis({ games }: { games: GeneratedGame[] }) {
  const analise = analisarLote(games);
  
  return (
    <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 border border-[var(--border)] mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Análise do Lote Atual</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {games.length} jogo{games.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Números em Comum */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span className="bg-blue-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            Números em Comum
          </h3>
          <div className="flex flex-wrap gap-2">
            {analise.comuns.length > 0 ? (
              analise.comuns.map(num => (
                <span key={num} className="dezena-bola bg-blue-100 border-blue-300 text-blue-800">
                  {num.toString().padStart(2, '0')}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Nenhum número presente em todos os jogos</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Aparecem em todos os jogos gerados ({analise.comuns.length})
          </p>
        </div>
        
        {/* Números Exclusivos */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <span className="bg-purple-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </span>
            Números Exclusivos
          </h3>
          <div className="flex flex-wrap gap-2">
            {analise.exclusivos.length > 0 ? (
              analise.exclusivos.map(num => (
                <span key={num} className="dezena-bola bg-purple-100 border-purple-300 text-purple-800">
                  {num.toString().padStart(2, '0')}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Nenhum número exclusivo encontrado</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Aparecem em apenas um jogo ({analise.exclusivos.length})
          </p>
        </div>
        
        {/* Números Excluídos */}
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <span className="bg-red-100 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
            Números Excluídos
          </h3>
          <div className="flex flex-wrap gap-2">
            {analise.excluidos.length > 0 ? (
              analise.excluidos.map(num => (
                <span key={num} className="dezena-bola bg-red-100 border-red-300 text-red-800">
                  {num.toString().padStart(2, '0')}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Todos os números foram utilizados</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Não aparecem em nenhum jogo ({analise.excluidos.length})
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Total de jogos no lote: {games.length} | Números analisados: {25 - analise.excluidos.length}/25
        </p>
      </div>
    </div>
  );
}