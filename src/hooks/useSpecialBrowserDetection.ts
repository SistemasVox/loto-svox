// =============================================================================
// ARQUIVO: src/hooks/useSpecialBrowserDetection.ts
// DESCRIÇÃO: Hook customizado para detectar navegadores específicos (Opera, Brave, Yandex)
//            que podem ter problemas ao renderizar o estilo de texto com gradiente.
// =============================================================================

import { useState, useEffect } from 'react';

export const useSpecialBrowserDetection = () => {
  const [isSpecialBrowser, setIsSpecialBrowser] = useState(false);

  useEffect(() => {
    // Garante que o código só rode no lado do cliente
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent;
        
        // Detecção para Opera
        const isOpera =
          (!!(window as any).opr && !!(window as any).opr.addons) ||
          !!(window as any).opera ||
          userAgent.indexOf(' OPR/') >= 0;

        // Detecção para Brave
        const isBrave = !!(navigator as any).brave;

        // Detecção para Yandex
        const isYandex = userAgent.indexOf('YaBrowser') > -1;

        setIsSpecialBrowser(isOpera || isBrave || isYandex);
    }
  }, []);

  return isSpecialBrowser;
};