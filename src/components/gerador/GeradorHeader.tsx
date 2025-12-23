/* =============================================================================
 * ARQUIVO: src/components/gerador/GeradorHeader.tsx
 * VERSÃO: 4.0.0 (Space Impact Complete Edition)
 * DESCRIÇÃO: Cabeçalho com simulação completa do Space Impact do Nokia
 * ============================================================================= */

import React, { useEffect, useRef, useState } from 'react';
import { getLevelDisplayName } from '@/utils/displayHelpers';

interface GeradorHeaderProps {
  isSpecialBrowser: boolean;
  user: any;
  subscriptionPlan: "free" | "basic" | "plus" | "premium";
  historicos: any[];
  savedGamesRemaining: number | null;
}

export default function GeradorHeader({ 
  isSpecialBrowser, 
  user, 
  subscriptionPlan, 
  historicos, 
  savedGamesRemaining 
}: GeradorHeaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [gameMode, setGameMode] = useState(false);
  const gameModeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Configuração do canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // ========== ESTADO DO JOGO ==========
    const gameState = {
      player: { x: 40, y: canvas.height / 2, width: 24, height: 14, speed: 2 },
      bullets: [] as Array<{ x: number; y: number; speed: number }>,
      enemies: [] as Array<{ x: number; y: number; width: number; height: number; type: number; hp: number; speedX: number; speedY: number; shootTimer: number }>,
      explosions: [] as Array<{ x: number; y: number; size: number; life: number }>,
      powerUps: [] as Array<{ x: number; y: number; type: number }>,
      particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>,
      boss: null as { x: number; y: number; width: number; height: number; hp: number; maxHp: number; phase: number; moveTimer: number; shootTimer: number } | null,
      score: 0,
      wave: 1,
      enemySpawnTimer: 0,
      bossSpawnTimer: 0,
      keys: {} as Record<string, boolean>
    };

    // ========== CONTROLES ==========
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        gameState.keys[key] = true;
        
        // Ativar modo jogo
        setGameMode(true);
        
        // Resetar timer
        if (gameModeTimerRef.current) {
          clearTimeout(gameModeTimerRef.current);
        }
        
        // Desativar após 5 segundos de inatividade
        gameModeTimerRef.current = setTimeout(() => {
          setGameMode(false);
        }, 5000);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // ========== FUNÇÕES DE SPAWN ==========
    const spawnEnemy = () => {
      const types = [1, 2, 3, 4]; // 4 tipos diferentes
      const type = types[Math.floor(Math.random() * types.length)];
      
      let width = 18, height = 18, hp = 1, speedX = -1.5, speedY = 0;
      
      switch(type) {
        case 1: // Inimigo rápido pequeno
          width = 12; height = 12; speedX = -2.5; hp = 1;
          break;
        case 2: // Inimigo médio zigzag
          width = 16; height = 16; speedX = -1.8; speedY = Math.random() > 0.5 ? 1 : -1; hp = 2;
          break;
        case 3: // Inimigo grande tanque
          width = 24; height = 20; speedX = -1; hp = 3;
          break;
        case 4: // Inimigo atirador
          width = 20; height = 18; speedX = -1.5; hp = 2;
          break;
      }
      
      gameState.enemies.push({
        x: canvas.width + 20,
        y: Math.random() * (canvas.height - height),
        width, height, type, hp,
        speedX, speedY,
        shootTimer: 0
      });
    };

    const spawnBoss = () => {
      gameState.boss = {
        x: canvas.width - 100,
        y: canvas.height / 2 - 30,
        width: 60,
        height: 60,
        hp: 50,
        maxHp: 50,
        phase: 1,
        moveTimer: 0,
        shootTimer: 0
      };
    };

    const spawnPowerUp = (x: number, y: number) => {
      if (Math.random() < 0.3) { // 30% chance
        gameState.powerUps.push({
          x, y,
          type: Math.floor(Math.random() * 3) + 1 // 1: rapid fire, 2: shield, 3: points
        });
      }
    };

    const createExplosion = (x: number, y: number, size: number = 20) => {
      gameState.explosions.push({ x, y, size, life: 20 });
      
      // Partículas da explosão
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        gameState.particles.push({
          x, y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 15,
          color: ['#ff6b00', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 3)]
        });
      }
    };

    // ========== LÓGICA DE ATUALIZAÇÃO ==========
    const update = () => {
      const p = gameState.player;

      // Movimento do jogador
      if (gameState.keys['w'] || gameState.keys['arrowup']) p.y = Math.max(0, p.y - p.speed);
      if (gameState.keys['s'] || gameState.keys['arrowdown']) p.y = Math.min(canvas.height - p.height, p.y + p.speed);
      if (gameState.keys['a'] || gameState.keys['arrowleft']) p.x = Math.max(0, p.x - p.speed);
      if (gameState.keys['d'] || gameState.keys['arrowright']) p.x = Math.min(canvas.width / 2, p.x + p.speed);

      // Disparo automático
      if (Math.random() < 0.15) {
        gameState.bullets.push({ x: p.x + p.width, y: p.y + p.height / 2, speed: 5 });
      }

      // Atualizar tiros
      gameState.bullets = gameState.bullets.filter(b => {
        b.x += b.speed;
        return b.x < canvas.width;
      });

      // Spawn de inimigos
      if (!gameState.boss) {
        gameState.enemySpawnTimer++;
        if (gameState.enemySpawnTimer > 60 - gameState.wave * 2) {
          spawnEnemy();
          gameState.enemySpawnTimer = 0;
        }

        // Spawn de boss a cada 30 kills
        gameState.bossSpawnTimer++;
        if (gameState.bossSpawnTimer > 1800) { // ~30 segundos
          spawnBoss();
          gameState.bossSpawnTimer = 0;
        }
      }

      // Atualizar inimigos
      gameState.enemies = gameState.enemies.filter(e => {
        e.x += e.speedX;
        
        // Movimento vertical para tipo 2
        if (e.type === 2) {
          e.y += e.speedY;
          if (e.y <= 0 || e.y >= canvas.height - e.height) e.speedY *= -1;
        }

        // Tiro de inimigos tipo 4
        if (e.type === 4) {
          e.shootTimer++;
          if (e.shootTimer > 60) {
            gameState.bullets.push({ x: e.x, y: e.y + e.height / 2, speed: -3 });
            e.shootTimer = 0;
          }
        }

        // Colisão com tiros
        for (let i = gameState.bullets.length - 1; i >= 0; i--) {
          const b = gameState.bullets[i];
          if (b.speed > 0 && b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
            e.hp--;
            gameState.bullets.splice(i, 1);
            
            if (e.hp <= 0) {
              createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.width);
              spawnPowerUp(e.x, e.y);
              gameState.score += e.type * 10;
              return false;
            }
          }
        }

        return e.x > -e.width;
      });

      // Atualizar Boss
      if (gameState.boss) {
        const boss = gameState.boss;
        boss.moveTimer++;
        boss.shootTimer++;

        // Movimento do boss
        if (boss.moveTimer < 60) {
          boss.y += Math.sin(boss.moveTimer / 10) * 2;
        } else if (boss.moveTimer < 120) {
          boss.x += Math.sin(boss.moveTimer / 10) * 1.5;
        } else {
          boss.moveTimer = 0;
        }

        // Mantém boss na tela
        boss.y = Math.max(0, Math.min(canvas.height - boss.height, boss.y));
        boss.x = Math.max(canvas.width - 150, Math.min(canvas.width - 50, boss.x));

        // Padrões de tiro do boss
        if (boss.shootTimer > 40) {
          if (boss.phase === 1) {
            // Tiro simples
            gameState.bullets.push({ x: boss.x, y: boss.y + boss.height / 2, speed: -4 });
          } else if (boss.phase === 2) {
            // Tiro triplo
            for (let i = -1; i <= 1; i++) {
              gameState.bullets.push({ x: boss.x, y: boss.y + boss.height / 2 + i * 15, speed: -4 });
            }
          }
          boss.shootTimer = 0;
        }

        // Colisão com tiros do jogador
        for (let i = gameState.bullets.length - 1; i >= 0; i--) {
          const b = gameState.bullets[i];
          if (b.speed > 0 && b.x > boss.x && b.x < boss.x + boss.width && 
              b.y > boss.y && b.y < boss.y + boss.height) {
            boss.hp--;
            gameState.bullets.splice(i, 1);
            createExplosion(b.x, b.y, 10);

            if (boss.hp <= 0) {
              createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 50);
              gameState.score += 500;
              gameState.wave++;
              gameState.boss = null;
            } else if (boss.hp < boss.maxHp / 2 && boss.phase === 1) {
              boss.phase = 2; // Fase 2 mais agressiva
            }
          }
        }
      }

      // Atualizar explosões
      gameState.explosions = gameState.explosions.filter(e => {
        e.life--;
        e.size += 1;
        return e.life > 0;
      });

      // Atualizar partículas
      gameState.particles = gameState.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      // Atualizar power-ups
      gameState.powerUps = gameState.powerUps.filter(pu => {
        pu.x -= 1;
        
        // Colisão com jogador
        if (Math.abs(pu.x - p.x) < 20 && Math.abs(pu.y - p.y) < 20) {
          gameState.score += 50;
          return false;
        }
        
        return pu.x > -20;
      });

      // Atualizar UI
      setScore(gameState.score);
      setWave(gameState.wave);
    };

    // ========== RENDERIZAÇÃO ==========
    const render = () => {
      // Fundo escuro com estrelas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Estrelas simples
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37 + Date.now() * 0.05) % canvas.width;
        const y = (i * 23) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
      }

      // Partículas
      gameState.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 15;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
      });

      // Explosões
      gameState.explosions.forEach(e => {
        ctx.strokeStyle = `rgba(255, ${100 + e.life * 5}, 0, ${e.life / 20})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Jogador (nave espacial detalhada)
      const p = gameState.player;
      
      // Corpo principal da nave (cinza metálico)
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width, p.y + p.height / 2);
      ctx.lineTo(p.x + p.width * 0.6, p.y);
      ctx.lineTo(p.x, p.y + p.height * 0.3);
      ctx.lineTo(p.x, p.y + p.height * 0.7);
      ctx.lineTo(p.x + p.width * 0.6, p.y + p.height);
      ctx.closePath();
      ctx.fill();
      
      // Cockpit (janela azul brilhante)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x + p.width * 0.7, p.y + p.height / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Detalhes metálicos (bordas escuras)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x + p.width, p.y + p.height / 2);
      ctx.lineTo(p.x + p.width * 0.6, p.y);
      ctx.lineTo(p.x, p.y + p.height * 0.3);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(p.x + p.width, p.y + p.height / 2);
      ctx.lineTo(p.x + p.width * 0.6, p.y + p.height);
      ctx.lineTo(p.x, p.y + p.height * 0.7);
      ctx.stroke();
      
      // Asa superior
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width * 0.4, p.y);
      ctx.lineTo(p.x + p.width * 0.5, p.y - 3);
      ctx.lineTo(p.x + p.width * 0.6, p.y);
      ctx.closePath();
      ctx.fill();
      
      // Asa inferior
      ctx.beginPath();
      ctx.moveTo(p.x + p.width * 0.4, p.y + p.height);
      ctx.lineTo(p.x + p.width * 0.5, p.y + p.height + 3);
      ctx.lineTo(p.x + p.width * 0.6, p.y + p.height);
      ctx.closePath();
      ctx.fill();
      
      // Propulsor (chama animada)
      const flameOffset = Math.sin(Date.now() / 50) * 2;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.height * 0.4);
      ctx.lineTo(p.x - 8 - flameOffset, p.y + p.height / 2);
      ctx.lineTo(p.x, p.y + p.height * 0.6);
      ctx.closePath();
      ctx.fill();
      
      // Núcleo do propulsor (branco brilhante)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.height * 0.45);
      ctx.lineTo(p.x - 4, p.y + p.height / 2);
      ctx.lineTo(p.x, p.y + p.height * 0.55);
      ctx.closePath();
      ctx.fill();

      // Tiros
      gameState.bullets.forEach(b => {
        ctx.fillStyle = b.speed > 0 ? '#60a5fa' : '#ef4444';
        ctx.fillRect(b.x, b.y - 1, 8, 2);
      });

      // Inimigos
      gameState.enemies.forEach(e => {
        const colors = ['#ef4444', '#f97316', '#8b5cf6', '#ec4899'];
        ctx.fillStyle = colors[e.type - 1];
        
        if (e.type === 1 || e.type === 2) {
          // Inimigo triangular
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + e.height / 2);
          ctx.lineTo(e.x + e.width, e.y);
          ctx.lineTo(e.x + e.width, e.y + e.height);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === 3) {
          // Inimigo retangular (tanque)
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(e.x + 5, e.y + 5, e.width - 10, e.height - 10);
        } else {
          // Inimigo com canhão
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillRect(e.x - 8, e.y + e.height / 2 - 2, 8, 4);
        }

        // Barra de HP para inimigos com HP > 1
        if (e.hp > 1) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(e.x, e.y - 5, e.width, 2);
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(e.x, e.y - 5, (e.width * e.hp) / (e.type === 2 ? 2 : 3), 2);
        }
      });

      // Boss
      if (gameState.boss) {
        const boss = gameState.boss;
        
        // Corpo do boss
        ctx.fillStyle = boss.phase === 1 ? '#9333ea' : '#dc2626';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Detalhes
        ctx.fillStyle = '#1f1f1f';
        ctx.fillRect(boss.x + 10, boss.y + 10, boss.width - 20, boss.height - 20);
        
        // "Olhos"
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(boss.x + 15, boss.y + 20, 8, 8);
        ctx.fillRect(boss.x + boss.width - 23, boss.y + 20, 8, 8);
        
        // Barra de HP do boss
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(boss.x, boss.y - 10, boss.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(boss.x, boss.y - 10, (boss.width * boss.hp) / boss.maxHp, 4);
        
        // Texto "BOSS"
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('BOSS', boss.x + boss.width / 2 - 15, boss.y - 15);
      }

      // Power-ups
      gameState.powerUps.forEach(pu => {
        const colors = ['#fbbf24', '#3b82f6', '#22c55e'];
        ctx.fillStyle = colors[pu.type - 1];
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // HUD: Score e Wave
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`SCORE: ${gameState.score}`, 10, 20);
      ctx.fillText(`WAVE: ${gameState.wave}`, 10, 40);
    };

    // ========== GAME LOOP ==========
    let animationId: number;
    const gameLoop = () => {
      update();
      render();
      animationId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameModeTimerRef.current) {
        clearTimeout(gameModeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-12 animate-slide-in bg-gray-900/95 backdrop-blur-md border border-gray-600/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
      
      {/* CANVAS DO JOGO */}
      <canvas 
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
          gameMode ? 'opacity-90' : 'opacity-30'
        }`}
        style={{ imageRendering: 'pixelated' }}
      />

      <div className={`text-center relative z-10 transition-opacity duration-500 ${
        gameMode ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative px-8 py-4" style={isSpecialBrowser ? titleStyleOpera : titleStyle}>
          <span className="relative z-10">Gerador Inteligente</span>
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-green-500/20 blur-2xl -z-10 scale-110" />
        </h1>

        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed" style={subtitleStyle}>
          Gere combinações estratégicas para a Lotofácil usando inteligência artificial
          e análise de dados históricos avançada
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {user && (
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-gray-300 font-mono">
                {user.name || user.email} • {getLevelDisplayName(subscriptionPlan)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg">
            <div className={`w-2 h-2 rounded-full ${historicos.length > 0 ? 'bg-blue-400' : 'bg-orange-400'}`} />
            <span className="text-sm text-gray-300 font-mono">
              {historicos.length > 0 ? `${historicos.length} concursos carregados` : 'Carregando dados...'}
            </span>
          </div>

          {user && savedGamesRemaining !== null && (
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md border border-gray-600/20 rounded-full py-2 px-4 shadow-lg animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm text-gray-300 font-mono">
                Jogos salvos: {savedGamesRemaining} restantes
              </span>
            </div>
          )}
        </div>
        
        {/* Dica de controle */}
        <div className="mt-4 text-xs text-gray-500 font-mono opacity-50">
          Pressione WASD para jogar Space Impact • Tiro automático
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      </div>

      {/* HUD do jogo - visível apenas no modo jogo */}
      <div className={`absolute top-4 left-4 right-4 transition-opacity duration-500 ${
        gameMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex justify-between items-start">
          {/* Score e Wave */}
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg px-4 py-3 shadow-xl">
            <div className="text-cyan-400 font-mono text-sm mb-1">SCORE</div>
            <div className="text-white font-bold font-mono text-2xl">{score.toString().padStart(6, '0')}</div>
            <div className="text-yellow-400 font-mono text-xs mt-2">WAVE {wave}</div>
          </div>
          
          {/* Instruções */}
          <div className="bg-black/80 backdrop-blur-md border border-purple-500/50 rounded-lg px-4 py-3 shadow-xl text-right">
            <div className="text-purple-400 font-mono text-xs">CONTROLS</div>
            <div className="text-white font-mono text-xs mt-1">WASD - Move</div>
            <div className="text-gray-400 font-mono text-xs">Auto Fire</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos de texto
const titleStyle: React.CSSProperties = { 
  fontWeight: 700, 
  letterSpacing: '-0.02em', 
  background: 'linear-gradient(135deg, #ffffff 0%, #0ea5e9 50%, #22c55e 100%)', 
  backgroundClip: 'text', 
  WebkitBackgroundClip: 'text', 
  WebkitTextFillColor: 'transparent' 
};

const titleStyleOpera: React.CSSProperties = { 
  fontWeight: 700, 
  letterSpacing: '-0.02em', 
  color: '#ffffff', 
  textShadow: '0 0 20px rgba(14, 165, 233, 0.8)' 
};

const subtitleStyle: React.CSSProperties = { 
  fontWeight: 400, 
  lineHeight: 1.6 
};