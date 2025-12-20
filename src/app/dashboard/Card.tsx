/* ############################################################
   #  File: src/app/dashboard/Card.tsx                        #
   #  Client Component – Card com efeito sonoro                #
   ############################################################ */

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  actionText: string
  color: 'cyan' | 'purple' | 'blue'
  sound: string
}

/* =============================================================================
 * HOOK: useBlobSound
 * DESCRIÇÃO: Carrega áudio como Blob e só permite reprodução após interação
 * ============================================================================= */
const useBlobSound = (soundPath: string) => {
  const [play, setPlay] = useState<() => void>(() => () => {});
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Marca que o usuário interagiu com a página
  const handleInteraction = () => {
    setUserInteracted(true);
  };

  useEffect(() => {
    // Adiciona listeners para detectar interação do usuário
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let blobUrl: string | null = null;

    const loadSound = async () => {
      try {
        const response = await fetch(soundPath);
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        
        audio = new Audio(blobUrl);
        audio.volume = 0.25; // Volume ajustado para 0.25 (igual ao anterior)
        audio.preload = "auto";

        setPlay(() => () => {
          if (audio && userInteracted) {
            // Só reproduz se o usuário já interagiu com a página
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Erro ao reproduzir áudio:", e));
          }
        });
        setAudioReady(true);
      } catch (error) {
        console.error("Erro ao carregar áudio:", error);
      }
    };

    loadSound();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
    };
  }, [soundPath, userInteracted]);

  return {
    play: userInteracted ? play : () => {}, // Só permite reprodução após interação
    audioReady
  };
};

export default function Card({
  href,
  icon,
  title,
  description,
  actionText,
  color,
  sound
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { play } = useBlobSound(sound);

  // Tocar som quando o hover começa e o áudio estiver pronto
  useEffect(() => {
    if (isHovered) {
      play();
    }
  }, [isHovered, play]);

  // Classes de cor baseadas na prop
  const colorClasses = {
    cyan: {
      borderHover: 'hover:border-cyan-500',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      hoverText: 'group-hover:text-cyan-100',
      actionText: 'text-cyan-400',
      iconContainer: 'bg-cyan-900',
      icon: 'text-cyan-400'
    },
    purple: {
      borderHover: 'hover:border-purple-500',
      gradient: 'from-purple-500/10 to-indigo-500/10',
      hoverText: 'group-hover:text-purple-100',
      actionText: 'text-purple-400',
      iconContainer: 'bg-purple-900',
      icon: 'text-purple-400'
    },
    blue: {
      borderHover: 'hover:border-blue-500',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      hoverText: 'group-hover:text-blue-100',
      actionText: 'text-blue-400',
      iconContainer: 'bg-blue-900',
      icon: 'text-blue-400'
    }
  };
  
  const currentColor = colorClasses[color];

  return (
    <Link
      href={href}
      className={`group relative bg-gray-800 rounded-2xl border border-slate-700 transition-all duration-300 p-6 shadow-xl hover:shadow-2xl overflow-hidden ${currentColor.borderHover}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${currentColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg mr-4 ${currentColor.iconContainer} ${currentColor.icon}`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        </div>
        <p className={`text-gray-300 transition-colors ${currentColor.hoverText}`}>
          {description}
        </p>
        <div className={`mt-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity ${currentColor.actionText}`}>
          {actionText}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ########################### End of file ########################### */