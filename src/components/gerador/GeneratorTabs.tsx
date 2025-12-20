// ====================================================================
// PATH: src/components/gerador/GeneratorTabs.tsx
// ====================================================================

import { FaDice, FaStar, FaGem, FaCrown, FaLock } from 'react-icons/fa';
import { GeneratorType, CATEGORY_LIMITS } from '@/types/generator';

export default function GeneratorTabs({
  activeTab,
  setActiveTab,
  batches,
  isLoggedIn,
  subscriptionPlan,
  onTabHover,
  onLockedTabClick
}: {
  activeTab: GeneratorType;
  setActiveTab: (tab: GeneratorType) => void;
  batches: Record<GeneratorType, any[]>;
  isLoggedIn: boolean;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  onTabHover: () => void;
  onLockedTabClick: (tab: GeneratorType) => void;
}) {
  const tabs: GeneratorType[] = ['free', 'basic', 'plus', 'premium'];
  
  // Função para verificar se o usuário tem acesso a um nível
  const hasAccess = (tab: GeneratorType) => {
    const planHierarchy = ["free", "basic", "plus", "premium"];
    const userLevel = planHierarchy.indexOf(subscriptionPlan);
    const tabLevel = planHierarchy.indexOf(tab);
    return userLevel >= tabLevel;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {tabs.map((type) => {
        const accessible = hasAccess(type);
        return (
          <div
            key={type}
            className={`
              rounded-xl p-4 cursor-pointer text-center border transition-all duration-300
              hover:-translate-y-1 relative
              ${activeTab === type 
                ? 'bg-[var(--blue)] text-white border-[var(--blue)] shadow-lg' 
                : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--blue)]'}
              ${!accessible ? 'opacity-70' : ''}
            `}
            onClick={() => {
              if (!accessible) {
                onLockedTabClick(type);
              } else {
                setActiveTab(type);
              }
            }}
            onMouseEnter={onTabHover}
          >
            {!accessible && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                <FaLock size={10} />
              </div>
            )}
            
            <div className="absolute top-2 left-2 bg-white text-[var(--blue)] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {(batches[type] ?? []).length}
            </div>
            
            <div className="flex justify-center mb-2">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${activeTab === type ? 'bg-white text-[var(--blue)]' : 'bg-[var(--blue)] text-white'}
              `}>
                {type === 'free' && <FaDice className="text-xl" />}
                {type === 'basic' && <FaStar className="text-xl" />}
                {type === 'plus' && <FaGem className="text-xl" />}
                {type === 'premium' && <FaCrown className="text-xl" />}
              </div>
            </div>
            <h3 className="font-semibold mb-1">
              {type === 'free' ? 'Gratuito' : 
               type === 'basic' ? 'Básico' : 
               type === 'plus' ? 'Plus' : 'Prêmio'}
            </h3>
            {!accessible && (
              <div className="text-xs text-red-500 flex items-center justify-center gap-1">
                <FaLock size={10} /> Upgrade necessário
              </div>
            )}
            <div className="text-xs mt-1">
              Limite: {CATEGORY_LIMITS[type]} jogos
            </div>
          </div>
        );
      })}
    </div>
  );
}