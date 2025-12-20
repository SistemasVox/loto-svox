// ===========================================
// src/app/faq/page.tsx
// ===========================================
import React from "react";

export const metadata = {
  title: "FAQ - Perguntas Frequentes - VOXStrategies",
  description: "Tire suas dúvidas sobre a VOXStrategies e nossas estratégias de análise de dados",
};

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h1>
          <p className="text-lg text-gray-600">
            Sua curiosidade é o primeiro passo para o sucesso! 🚀
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Encontre respostas para as dúvidas mais comuns sobre nossa plataforma
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-10">
          
          {/* Seção Hero com estatísticas */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-8 rounded-lg mb-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">💡 Você Não Está Sozinho!</h2>
              <p className="text-gray-600">
                Milhares de usuários já transformaram suas estratégias com a VOXStrategies
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Satisfação dos usuários</div>
              </div>
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-gray-600">Suporte disponível</div>
              </div>
              <div className="text-center bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">+50k</div>
                <div className="text-sm text-gray-600">Estratégias analisadas</div>
              </div>
            </div>
          </section>

          {/* Categorias de perguntas */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-bold text-blue-800">Como Funciona</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-green-800">Análises & Dados</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">💎</div>
              <div className="font-bold text-purple-800">Planos & Preços</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-bold text-orange-800">Segurança</div>
            </div>
          </div>

          {/* Seção 1: Como Funciona */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              🔍 Como Funciona a VOXStrategies?
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-3">❓ O que exatamente é a VOXStrategies?</h3>
                <p className="text-blue-800 leading-relaxed">
                  Somos uma plataforma revolucionária que combina inteligência artificial, análise estatística avançada 
                  e big data para criar estratégias personalizadas. Pensem em nós como seu laboratório de análise 
                  estratégica pessoal, onde cada padrão é uma oportunidade! 🧪✨
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-3">❓ Como vocês analisam os dados?</h3>
                <p className="text-blue-800 leading-relaxed">
                  Utilizamos algoritmos proprietários que processam milhões de pontos de dados históricos, 
                  identificam padrões estatísticos significativos e aplicam modelos preditivos avançados. 
                  É como ter um supercomputador dedicado exclusivamente a encontrar as melhores oportunidades para você! 🎯
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-3">❓ Preciso ter conhecimento técnico para usar?</h3>
                <p className="text-blue-800 leading-relaxed">
                  Absolutamente não! Nossa interface foi desenhada para ser intuitiva e amigável. 
                  Transformamos análises complexas em insights claros e acionáveis. Se você sabe usar um smartphone, 
                  você consegue dominar nossa plataforma! 📱💪
                </p>
              </div>
            </div>
          </section>

          {/* Seção 2: Análises & Dados */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">
              📊 Análises & Dados
            </h2>
            
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-green-900 mb-3">❓ Com que frequência os dados são atualizados?</h3>
                <p className="text-green-800 leading-relaxed">
                  Nossos sistemas trabalham 24/7! Os dados são atualizados em tempo real, e nossas análises 
                  são recalculadas continuamente para garantir que você sempre tenha as informações mais 
                  frescas e relevantes. É como ter um analista que nunca dorme! ⏰🔄
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-green-900 mb-3">❓ Posso confiar na precisão das análises?</h3>
                <p className="text-green-800 leading-relaxed">
                  Nossos algoritmos passam por testes rigorosos e validação cruzada constante. Mantemos 
                  transparência total sobre nossas metodologias e fornecemos métricas de confiabilidade 
                  para cada análise. Confiança se constrói com transparência! 🔍✅
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-green-900 mb-3">❓ Vocês garantem resultados específicos?</h3>
                <p className="text-green-800 leading-relaxed">
                  Somos honestos: não oferecemos garantias de resultados específicos, pois isso seria impossível 
                  e antiético. O que garantimos é análise de qualidade superior, metodologia comprovada e 
                  ferramentas que maximizam suas chances de sucesso. A honestidade é nossa política! 💯
                </p>
              </div>
            </div>
          </section>

          {/* Seção 3: Planos & Preços */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-purple-500 pb-2">
              💎 Planos & Preços
            </h2>
            
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-purple-900 mb-3">❓ Existe um plano gratuito?</h3>
                <p className="text-purple-800 leading-relaxed">
                  Sim! Oferecemos um plano inicial que permite experimentar nossas ferramentas básicas. 
                  É nossa forma de mostrar o valor que podemos entregar. Acreditamos que uma vez que você 
                  experimente nossa qualidade, vai querer mais! 🎁🚀
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-purple-900 mb-3">❓ Qual a diferença entre os planos?</h3>
                <p className="text-purple-800 leading-relaxed">
                  Cada plano oferece níveis diferentes de acesso às nossas análises e ferramentas. 
                  Planos superiores incluem análises mais profundas, suporte prioritário e recursos 
                  exclusivos. É como escolher entre diferentes níveis de superpoderes! ⚡💫
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-purple-900 mb-3">❓ Posso cancelar a qualquer momento?</h3>
                <p className="text-purple-800 leading-relaxed">
                  Claro! Não fazemos contratos de longo prazo ou burocracias complicadas. 
                  Você pode cancelar quando quiser, sem taxas ocultas ou penalidades. 
                  Liberdade total é fundamental! 🗝️✨
                </p>
              </div>
            </div>
          </section>

          {/* Seção 4: Segurança */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-orange-500 pb-2">
              🛡️ Segurança & Privacidade
            </h2>
            
            <div className="space-y-6">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-orange-900 mb-3">❓ Meus dados estão seguros?</h3>
                <p className="text-orange-800 leading-relaxed">
                  Absolutamente! Utilizamos criptografia de nível militar, servidores seguros e 
                  seguimos os mais rigorosos protocolos de segurança internacionais. 
                  Seus dados são tratados como o tesouro que realmente são! 🔐💎
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-orange-900 mb-3">❓ Vocês compartilham informações pessoais?</h3>
                <p className="text-orange-800 leading-relaxed">
                  Jamais! Sua privacidade é sagrada. Não vendemos, alugamos ou compartilhamos 
                  suas informações pessoais com terceiros. O que é seu, é seu - ponto final! 🚫👥
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-orange-900 mb-3">❓ Como é o suporte ao cliente?</h3>
                <p className="text-orange-800 leading-relaxed">
                  Nossa equipe de suporte é formada por especialistas apaixonados pelo que fazem! 
                  Estamos disponíveis 24/7 através de chat, email e telefone. 
                  Sua satisfação é nossa missão diária! 🎯❤️
                </p>
              </div>
            </div>
          </section>

          {/* Seção Bônus: Dicas de Sucesso */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🌟 Dicas de Ouro para Maximizar seu Sucesso
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-200 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">📚</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800">Estude os Padrões</h4>
                    <p className="text-yellow-700 text-sm">Dedique tempo para entender as análises. Conhecimento é poder!</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-200 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">⚖️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800">Mantenha o Equilíbrio</h4>
                    <p className="text-yellow-700 text-sm">Use estratégias como parte de um plano maior, não como única solução.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-200 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800">Monitore Resultados</h4>
                    <p className="text-yellow-700 text-sm">Acompanhe seu progresso e ajuste estratégias conforme necessário.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-200 rounded-full p-2 flex-shrink-0">
                    <span className="text-lg">🤝</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800">Conecte-se Conosco</h4>
                    <p className="text-yellow-700 text-sm">Nossa equipe está sempre pronta para ajudar você a crescer!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Final */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ainda tem dúvidas? 🤔</h2>
            <p className="text-lg mb-6">
              Nossa equipe de especialistas está ansiosa para ajudar você a começar sua jornada de sucesso!
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="font-bold mb-1">Chat ao Vivo</h3>
                <p className="text-sm opacity-90">Resposta em segundos</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur">
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-bold mb-1">Email Direto</h3>
                <p className="text-sm opacity-90">Resposta em até 2h</p>
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur">
                <div className="text-2xl mb-2">📞</div>
                <h3 className="font-bold mb-1">Telefone VIP</h3>
                <p className="text-sm opacity-90">Suporte personalizado</p>
              </div>
            </div>
          </section>

          {/* Rodapé da página */}
          <section className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">
              💡 <strong>Dica:</strong> Marque esta página nos favoritos para consultas rápidas!
            </p>
            <p className="text-sm text-gray-500">
              Esta página é atualizada regularmente com novas perguntas da nossa comunidade.
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