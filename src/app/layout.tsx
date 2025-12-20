// ======================================================================
// ARQUIVO: src/app/layout.tsx
// DESCRIÇÃO: Contentor global da aplicação (Server Component).
//            Gere Metadados, Viewport e o Sistema de Notificações.
// ======================================================================

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import NotificationManager from '@/components/NotificationManager';

// Configuração da fonte principal com suporte a variáveis CSS
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

/**
 * METADADOS (SEO): Configuração para motores de busca.
 * Nota: O campo 'viewport' foi removido daqui para cumprir o padrão Next.js 15.
 */
export const metadata: Metadata = {
  title: 'VOXStrategies - Loto SVOX',
  description: 'Análise de dados e gerador inteligente para potencializar seus jogos na Lotofácil.',
  robots: 'index, follow',
};

/**
 * VIEWPORT: Configurações de renderização do browser (Next.js 15+).
 * Define a cor do tema para dispositivos móveis (Heurística de Branding).
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617', // Azul Marinho Loto
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={cn(
        'relative min-h-screen bg-[#020617] font-sans antialiased text-slate-200 selection:bg-orange-500/30',
        inter.variable
      )}>
        
        {/* CAMADA DE FUNDO: Gradiente Azul Marinho Profundo (Heurística H8) */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] -z-20" />
        
        {/* EFEITOS VISUAIS: Marca d'água e Brilhos Sutis (Branding Loto) */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-[url('/logo1.png')] bg-center bg-no-repeat bg-contain opacity-[0.03]"
            style={{
              filter: "blur(8px) brightness(1.2)",
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 75%)"
            }}
          />
          {/* Iluminação ambiente Laranja e Verde nos cantos */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20" />
        </div>

        {/* ESTRUTURA DA APLICAÇÃO */}
        <div className="relative flex min-h-screen flex-col">
          <Header />
          
          {/* Main: Espaçamento otimizado para legibilidade (H8) */}
          <main className="flex-grow pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          <Footer />
        </div>

        {/* GESTOR DE NOTIFICAÇÕES: Feedback em Tempo Real (Heurística H1) */}
        <NotificationManager />
      </body>
    </html>
  );
}