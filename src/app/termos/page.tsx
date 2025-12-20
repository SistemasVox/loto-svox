// ===========================================
// src/app/responsabilidade/page.tsx
// ===========================================
import React from "react";

export const metadata = {
  title: "Jogo Responsável - VOXStrategies",
  description: "Pratique o jogo responsável com a VOXStrategies",
};

export default function ResponsabilidadePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Jogo Responsável</h1>
          <p className="text-lg text-gray-600">
            Potencialize sua sorte com sabedoria e responsabilidade! 🧠✨
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sua diversão e bem-estar são nossa prioridade
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-8">
          
          <section>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🌟 Nossa Filosofia</h2>
              <p className="text-lg leading-relaxed">
                Na VOXStrategies, acreditamos que a verdadeira sorte vem de decisões inteligentes e conscientes. 
                Nossa missão é potencializar suas oportunidades de forma <strong>responsável</strong>, 
                <strong>divertida</strong> e <strong>sustentável</strong>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Os Pilares do Jogo Inteligente</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="bg-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-blue-800 mb-2">Controle Total</h3>
                <p className="text-blue-700 text-sm">
                  Você sempre tem o controle das suas decisões. Nossa tecnologia é uma ferramenta, 
                  não um comandante.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="font-bold text-green-800 mb-2">Equilíbrio</h3>
                <p className="text-green-700 text-sm">
                  Jogos devem ser uma fonte de entretenimento, não de estresse. Mantenha sempre 
                  o equilíbrio na sua vida.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="bg-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-bold text-purple-800 mb-2">Consciência</h3>
                <p className="text-purple-700 text-sm">
                  Esteja sempre consciente dos seus limites, objetivos e do impacto das suas 
                  escolhas no seu bem-estar.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Diretrizes para o Sucesso Sustentável</h2>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-3">💰 Gestão Financeira Inteligente</h3>
                <ul className="text-yellow-700 space-y-2">
                  <li><strong>• Defina um orçamento:</strong> Determine um valor que você pode gastar sem comprometer suas necessidades básicas</li>
                  <li><strong>• Nunca persiga perdas:</strong> Se não teve sorte hoje, amanhã é um novo dia com novas oportunidades</li>
                  <li><strong>• Celebre as vitórias:</strong> Quando ganhar, aproveite conscientemente e considere guardar parte do valor</li>
                  <li><strong>• Use dinheiro livre:</strong> Jogue apenas com dinheiro destinado ao entretenimento, nunca com recursos essenciais</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-3">⏰ Gestão de Tempo Saudável</h3>
                <ul className="text-blue-700 space-y-2">
                  <li><strong>• Estabeleça limites de tempo:</strong> Defina quanto tempo dedicará às estratégias por dia/semana</li>
                  <li><strong>• Faça pausas regulares:</strong> Sua mente trabalha melhor quando descansada</li>
                  <li><strong>• Mantenha outros hobbies:</strong> Diversifique suas fontes de diversão e satisfação</li>
                  <li><strong>• Qualidade sobre quantidade:</strong> É melhor jogar menos vezes com mais estratégia</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">🎭 Atitude Mental Positiva</h3>
                <ul className="text-green-700 space-y-2">
                  <li><strong>• Foque na diversão:</strong> O entretenimento deve ser o objetivo principal</li>
                  <li><strong>• Aceite os resultados:</strong> Nem sempre vamos ganhar, e tudo bem!</li>
                  <li><strong>• Aprenda constantemente:</strong> Cada experiência é uma oportunidade de crescimento</li>
                  <li><strong>• Mantenha perspectiva:</strong> Jogos são uma parte pequena de uma vida completa e rica</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sinais de Alerta - Fique Atento</h2>
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <p className="text-red-800 mb-4 font-medium">
                🚨 Se você identificar algum desses comportamentos, é hora de fazer uma pausa e reavaliar:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-red-800 mb-2">Sinais Comportamentais:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Pensar constantemente em jogos</li>
                    <li>• Gastar mais do que o planejado</li>
                    <li>• Mentir sobre gastos ou tempo de jogo</li>
                    <li>• Negligenciar responsabilidades</li>
                    <li>• Usar o jogo para escapar de problemas</li>
                    <li>• Sentir irritação quando não pode jogar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-800 mb-2">Sinais Emocionais:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Ansiedade relacionada a resultados</li>
                    <li>• Mudanças bruscas de humor</li>
                    <li>• Isolamento social</li>
                    <li>• Perda de interesse em outras atividades</li>
                    <li>• Sentimentos de culpa ou vergonha</li>
                    <li>• Estresse financeiro constante</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ferramentas de Autocontrole</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-blue-800 mb-3">🛡️ Proteções Preventivas</h3>
                  <ul className="text-blue-700 space-y-2 text-sm">
                    <li><strong>• Limites de depósito:</strong> Configure valores máximos diários/mensais</li>
                    <li><strong>• Alertas de tempo:</strong> Receba notificações sobre tempo de jogo</li>
                    <li><strong>• Pausas obrigatórias:</strong> Configure intervalos automáticos</li>
                    <li><strong>• Histórico transparente:</strong> Acompanhe todos os seus gastos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-purple-800 mb-3">📊 Monitoramento Inteligente</h3>
                  <ul className="text-purple-700 space-y-2 text-sm">
                    <li><strong>• Relatórios semanais:</strong> Analise seus padrões de jogo</li>
                    <li><strong>• Metas de gastos:</strong> Defina e acompanhe orçamentos</li>
                    <li><strong>• Check-ups regulares:</strong> Avalie periodicamente seus hábitos</li>
                    <li><strong>• Sessões de reflexão:</strong> Questione seus motivos para jogar</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Recursos de Apoio</h2>
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg">
                <h3 className="font-bold text-teal-800 mb-3">🤝 Precisa de Ajuda?</h3>
                <p className="text-teal-700 mb-4">
                  Reconhecer que precisa de apoio é um sinal de força, não de fraqueza. 
                  Existem recursos profissionais disponíveis para ajudá-lo:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border border-teal-200">
                    <h4 className="font-bold text-teal-800 mb-2">📞 Linhas de Apoio</h4>
                    <ul className="text-teal-700 text-sm space-y-1">
                      <li>• CVV: 188 (24h gratuito)</li>
                      <li>• Jogadores Anônimos</li>
                      <li>• Terapeutas especializados</li>
                      <li>• Grupos de apoio online</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border border-teal-200">
                    <h4 className="font-bold text-teal-800 mb-2">🌐 Recursos Online</h4>
                    <ul className="text-teal-700 text-sm space-y-1">
                      <li>• Testes de autoavaliação</li>
                      <li>• Fóruns de discussão</li>
                      <li>• Materiais educativos</li>
                      <li>• Apps de controle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Compromisso VOXStrategies</h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">🌟 Nossa Promessa para Você</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Transparência Total:</strong> Todas as nossas estratégias são baseadas em dados reais 
                  e estatísticas verificáveis, sem promessas falsas.
                </p>
                <p>
                  <strong>Educação Contínua:</strong> Fornecemos constantemente conteúdo educativo sobre 
                  probabilidades, gestão de risco e jogo responsável.
                </p>
                <p>
                  <strong>Suporte Dedicado:</strong> Nossa equipe está sempre disponível para esclarecer 
                  dúvidas e orientar sobre práticas responsáveis.
                </p>
                <p>
                  <strong>Inovação Ética:</strong> Desenvolvemos tecnologias que priorizam o bem-estar 
                  do usuário acima de qualquer outra métrica.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-900 mb-3">💡 Lembre-se Sempre</h3>
              <p className="text-lg text-gray-700 font-medium mb-4">
                "A verdadeira vitória não está em ganhar sempre, mas em jogar de forma inteligente e responsável"
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm font-medium text-gray-700">Mantenha o controle</p>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl mb-2">⚖️</div>
                  <p className="text-sm font-medium text-gray-700">Busque o equilíbrio</p>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-2xl mb-2">🌟</div>
                  <p className="text-sm font-medium text-gray-700">Divirta-se com sabedoria</p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Esta página foi desenvolvida em conformidade com as melhores práticas de jogo responsável 
              e é atualizada regularmente para refletir as mais recentes diretrizes do setor.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}