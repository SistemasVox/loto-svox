'use client';

import React from 'react';
import Link from 'next/link';

interface ToastProps {
  message: string;
  link?: string;
  onClose: () => void;
}

export default function ToastNotification({ message, link, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-10 right-10 z-[100] animate-bounce-in">
      <div className="bg-[#0f172a] border-l-4 border-green-500 p-5 shadow-[0_0_30px_rgba(34,197,94,0.2)] rounded-r-lg max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="font-mono">
            <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-1">
              {">"}_ Alerta de Sistema
            </p>
            <p className="text-white text-sm leading-relaxed font-bold">
              {message}
            </p>
            {link && (
              <Link href={link} className="text-orange-500 text-xs font-bold underline mt-3 inline-block hover:text-orange-400">
                CLIQUE AQUI PARA VER DETALHES
              </Link>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-lg"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}