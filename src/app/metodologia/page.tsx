// ===========================================
// src/app/metodologia/page.tsx
// ===========================================


import React from "react";

export default function MetodologiaPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Metodologia VOXStrategies</h1>
          <p className="text-lg text-gray-600">
            Transformando dados em decisões inteligentes através da ciência 🧬✨
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Nossa abordagem científica para maximizar oportunidades
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-8">
          
          <section>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 Nossa Visão Metodológica</h2>
              <p className="text-lg leading-relaxed">
                Na VOXStrategies, desenvolvemos uma metodologia proprietária que combina <strong>análise estatística avançada</strong>, 
                <strong>inteligência artificial</strong> e <strong>comportamento humano</strong> para criar estratégias 
                otimizadas e responsáveis. Nossa abordagem é fundamentada em três pilares: <em>Precisão</em>, <em>Transparência</em> e <em>Inovação</em>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔬 O Método VOX-PRIME</h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
              <p className="text-center text-lg font-semibold text-gray-800 mb-4">
                Probabilistic Risk Intelligence & Modeling Excellence
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="bg-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold text-blue-800 mb-2 text-center">Análise Preditiva</h3>
                <p className="text-blue-700 text-sm text-center">
                  Utilizamos algoritmos de machine learning para identificar padrões 
                  complexos em grandes volumes de dados históricos.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="bg-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-bold text-green-800 mb-2 text-center">Otimização Dinâmica</h3>
                <p className="text-green-700 text-sm text-center">
                  Nossos modelos se adaptam em tempo real, ajustando estratégias 
                  conforme novos dados são processados.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ As 5 Fases da Metodologia VOX</h2>
            
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-3">1. 🔍 DESCOBERTA (Discovery)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">Coleta de Dados</h4>
                    <ul className="text-purple-600 text-sm space-y-1">
                      <li>• Análise de séries temporais históricas</li>
                      <li>• Mapeamento de tendências sazonais</li>
                      <li>• Identificação de anomalias estatísticas</li>
                      <li>• Validação cruzada de fontes múltiplas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">Pré-processamento</h4>
                    <ul className="text-purple-600 text-sm space-y-1">
                      <li>• Limpeza e normalização de dados</li>
                      <li>• Tratamento de valores ausentes</li>
                      <li>• Detecção de outliers inteligente</li>
                      <li>• Enriquecimento contextual</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-3">2. 🧮 ANÁLISE (Analysis)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Modelagem Estatística</h4>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• Regressões multivariadas avançadas</li>
                      <li>• Análise de correlações complexas</li>
                      <li>• Testes de hipóteses robustos</li>
                      <li>• Simulações Monte Carlo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">IA & Machine Learning</h4>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• Redes neurais profundas</li>
                      <li>• Algoritmos de ensemble</li>
                      <li>• Processamento de linguagem natural</li>
                      <li>• Visão computacional para padrões</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">3. 🔮 PREDIÇÃO (Prediction)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Modelos Preditivos</h4>
                    <ul className="text-green-600 text-sm space-y-1">
                      <li>• Forecasting probabilístico</li>
                      <li>• Intervalos de confiança dinâmicos</li>
                      <li>• Cenários multi-dimensionais</li>
                      <li>• Backtesting rigoroso</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Validação Cruzada</h4>
                    <ul className="text-green-600 text-sm space-y-1">
                      <li>• Testes out-of-sample</li>
                      <li>• Validação temporal estratificada</li>
                      <li>• Métricas de performance robustas</li>
                      <li>• Análise de estabilidade</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-3">4. ⚡ OTIMIZAÇÃO (Optimization)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-yellow-700 mb-2">Estratégias Adaptativas</h4>
                    <ul className="text-yellow-600 text-sm space-y-1">
                      <li>• Algoritmos genéticos</li>
                      <li>• Otimização multi-objetivo</li>
                      <li>• Balanceamento risco-retorno</li>
                      <li>• Ajuste automático de parâmetros</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-700 mb-2">Gestão de Risco</h4>
                    <ul className="text-yellow-600 text-sm space-y-1">
                      <li>• Value at Risk (VaR) avançado</li>
                      <li>• Stress testing contínuo</li>
                      <li>• Análise de sensibilidade</li>
                      <li>• Limites dinâmicos inteligentes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-lg">
                <h3 className="font-bold text-teal-800 mb-3">5. 📈 IMPLEMENTAÇÃO (Implementation)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-teal-700 mb-2">Execução Inteligente</h4>
                    <ul className="text-teal-600 text-sm space-y-1">
                      <li>• Deploy automatizado de modelos</li>
                      <li>• Monitoramento em tempo real</li>
                      <li>• Alertas preditivos</li>
                      <li>• Ajustes automáticos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-teal-700 mb-2">Feedback Contínuo</h4>
                    <ul className="text-teal-600 text-sm space-y-1">
                      <li>• Loop de aprendizado contínuo</li>
                      <li>• Métricas de performance live</li>
                      <li>• Relatórios analíticos detalhados</li>
                      <li>• Refinamento incremental</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ Tecnologias e Ferramentas</h2>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Inteligência Artificial</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>TensorFlow & PyTorch</li>
                    <li>Scikit-learn</li>
                    <li>XGBoost & LightGBM</li>
                    <li>Deep Learning</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Análise de Dados</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>Python & R</li>
                    <li>Apache Spark</li>
                    <li>Pandas & NumPy</li>
                    <li>Matplotlib & Plotly</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">☁️</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Infraestrutura</h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>Cloud Computing</li>
                    <li>Docker & Kubernetes</li>
                    <li>Apache Kafka</li>
                    <li>Redis & PostgreSQL</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📏 Métricas e KPIs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-3">🎯 Precisão dos Modelos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Acurácia Preditiva</span>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">87.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Precisão Temporal</span>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">82.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Recall Estratégico</span>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">89.7%</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">⚡ Performance Operacional</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Tempo de Processamento</span>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">&lt; 200ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Disponibilidade</span>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Escalabilidade</span>
                    <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">Auto</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🌟 Diferenciais Competitivos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg">
                  <h3 className="font-bold text-purple-800 mb-2">🚀 Inovação Contínua</h3>
                  <p className="text-purple-700 text-sm">
                    Investimos 25% dos nossos recursos em P&D, sempre na vanguarda 
                    das tecnologias emergentes em IA e análise preditiva.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">🔒 Segurança Total</h3>
                  <p className="text-blue-700 text-sm">
                    Criptografia end-to-end, compliance LGPD/GDPR e auditoria 
                    independente garantem a proteção total dos seus dados.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">⚡ Velocidade Incomparável</h3>
                  <p className="text-green-700 text-sm">
                    Nossa arquitetura distribuída processa milhões de pontos de dados 
                    em tempo real, oferecendo insights instantâneos.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">🎯 Personalização Extrema</h3>
                  <p className="text-yellow-700 text-sm">
                    Cada usuário tem um perfil único, com estratégias adaptadas 
                    ao seu estilo, objetivos e tolerância ao risco.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔮 Futuro da Metodologia VOX</h2>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-lg">
              <h3 className="font-bold text-indigo-800 mb-3">🌈 Próximas Inovações</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-indigo-700 mb-2">Tecnologias Emergentes</h4>
                  <ul className="text-indigo-600 text-sm space-y-2">
                    <li><strong>• Computação Quântica:</strong> Algoritmos exponencialmente mais rápidos</li>
                    <li><strong>• IA Explicável:</strong> Transparência total nas decisões dos modelos</li>
                    <li><strong>• Blockchain Analytics:</strong> Rastreabilidade e auditoria descentralizada</li>
                    <li><strong>• Federated Learning:</strong> Aprendizado distribuído preservando privacidade</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-700 mb-2">Novos Paradigmas</h4>
                  <ul className="text-indigo-600 text-sm space-y-2">
                    <li><strong>• AutoML Avançado:</strong> Otimização automática de hiperparâmetros</li>
                    <li><strong>• Análise Multimodal:</strong> Fusão de dados estruturados e não-estruturados</li>
                    <li><strong>• Edge Computing:</strong> Processamento local ultra-rápido</li>
                    <li><strong>• Neuro-Symbolic AI:</strong> Combinação de redes neurais e lógica simbólica</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-900 mb-3">💡 Nossa Missão</h3>
              <p className="text-lg text-gray-700 font-medium mb-4">
                "Democratizar o acesso à inteligência artificial aplicada, transformando dados complexos 
                em decisões simples, éticas e lucrativas para todos."
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded border shadow-sm">
                  <div className="text-2xl mb-2">🔬</div>
                  <p className="text-sm font-medium text-gray-700">Ciência Rigorosa</p>
                </div>
                <div className="bg-white p-4 rounded border shadow-sm">
                  <div className="text-2xl mb-2">🤝</div>
                  <p className="text-sm font-medium text-gray-700">Ética Transparente</p>
                </div>
                <div className="bg-white p-4 rounded border shadow-sm">
                  <div className="text-2xl mb-2">🚀</div>
                  <p className="text-sm font-medium text-gray-700">Inovação Constante</p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Nossa metodologia é constantemente refinada e aprimorada por uma equipe multidisciplinar 
              de cientistas de dados, engenheiros de software e especialistas em IA.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Versão atual: VOX-PRIME 3.2 | Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}