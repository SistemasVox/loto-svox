// src/components/gerador/LevelComparison.tsx
import { FaLock, FaCheck, FaTimes, FaStar, FaGem, FaCrown } from 'react-icons/fa';

export default function LevelComparison({ 
  isLoggedIn,
  subscriptionPlan,
  onPlanHover,
  onUpgradeClick
}: { 
  isLoggedIn: boolean;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  onPlanHover: () => void;
  onUpgradeClick: (plan: string) => void;
}) {
  // Função para verificar se o usuário tem acesso a um plano
  const hasAccess = (plan: string) => {
    const planHierarchy = ["free", "basic", "plus", "premium"];
    const userLevel = planHierarchy.indexOf(subscriptionPlan);
    const planLevel = planHierarchy.indexOf(plan);
    return userLevel >= planLevel;
  };

  // Obter ícone e nome do plano
  const getPlanDetails = (plan: string) => {
    switch(plan) {
      case 'basic': 
        return { icon: <FaStar className="text-yellow-500" />, name: 'Básico' };
      case 'plus': 
        return { icon: <FaGem className="text-blue-500" />, name: 'Plus' };
      case 'premium': 
        return { icon: <FaCrown className="text-purple-500" />, name: 'Prêmio' };
      default:
        return { icon: null, name: plan };
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-xl shadow-lg p-6 border border-[var(--border)]">
      <h2 className="text-xl font-semibold mb-6 text-center">Comparação de Níveis</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left pb-3">Recurso</th>
              <th 
                className="text-center pb-3 cursor-pointer hover:text-[var(--blue)] transition-colors"
                onMouseEnter={onPlanHover}
              >Gratuito</th>
              <th 
                className="text-center pb-3 cursor-pointer hover:text-[var(--blue)] transition-colors"
                onMouseEnter={onPlanHover}
              >Básico</th>
              <th 
                className="text-center pb-3 cursor-pointer hover:text-[var(--blue)] transition-colors"
                onMouseEnter={onPlanHover}
              >Plus</th>
              <th 
                className="text-center pb-3 cursor-pointer hover:text-[var(--blue)] transition-colors"
                onMouseEnter={onPlanHover}
              >Prêmio</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3">Geração aleatória simples</td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3">Análise de números atrasados</td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3">Análise de frequência</td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3">Distribuição por quadrantes</td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
            </tr>
            <tr className="border-b border-[var(--border)]">
              <td className="py-3">Combinação balanceada (frios/quentes)</td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaTimes className="text-red-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
              <td className="text-center"><FaCheck className="text-green-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-3">Limite de jogos simultâneos</td>
              <td className="text-center">3</td>
              <td className="text-center">6</td>
              <td className="text-center">10</td>
              <td className="text-center">30</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-center">
        {!isLoggedIn ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
            <FaLock size={14} /> Faça login para acessar os níveis avançados
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {['basic', 'plus', 'premium'].map(plan => {
              const accessible = hasAccess(plan);
              const { icon, name } = getPlanDetails(plan);
              
              return (
                <button
                  key={plan}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    accessible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  onClick={() => !accessible && onUpgradeClick(plan)}
                  disabled={accessible}
                >
                  {accessible ? (
                    <>
                      <FaCheck className="text-green-500" />
                      Acesso Liberado
                    </>
                  ) : (
                    <>
                      {icon}
                      Trocar para {name}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}