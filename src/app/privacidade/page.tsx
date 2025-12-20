// ===========================================
// src/app/privacidade/page.tsx
// ===========================================
import React from "react";

export const metadata = {
  title: "Política de Privacidade - VOXStrategies",
  description: "Entenda como tratamos dados na VOXStrategies",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
          <p className="text-lg text-gray-600">
            Sua privacidade é nossa prioridade absoluta! 🔒
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-8">
          
          <section>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">🛡️ Nossa Promessa de Privacidade</h2>
              <p className="text-green-700 text-lg">
                Na VOXStrategies, acreditamos que sua privacidade é sagrada. Por isso, adotamos uma 
                abordagem <strong>Privacy by Design</strong> - não coletamos, não armazenamos e não 
                compartilhamos seus dados pessoais. Ponto final!
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. O Que NÃO Fazemos com Seus Dados</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-3">❌ Nunca Coletamos:</h3>
                <ul className="text-red-700 space-y-1">
                  <li>• Dados pessoais identificáveis</li>
                  <li>• Informações financeiras</li>
                  <li>• Histórico de navegação pessoal</li>
                  <li>• Localização geográfica</li>
                  <li>• Contatos ou lista de amigos</li>
                  <li>• Senhas ou credenciais</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-3">🚫 Nunca Fazemos:</h3>
                <ul className="text-red-700 space-y-1">
                  <li>• Venda de dados para terceiros</li>
                  <li>• Rastreamento entre sites</li>
                  <li>• Criação de perfis pessoais</li>
                  <li>• Armazenamento de conversas</li>
                  <li>• Análise comportamental pessoal</li>
                  <li>• Marketing direcionado</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Funcionamos Sem Dados</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-blue-800 mb-4">
                Nossa plataforma foi projetada para funcionar de forma completamente anônima e local:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🖥️</span>
                  </div>
                  <h4 className="font-bold text-blue-800">Processamento Local</h4>
                  <p className="text-blue-700 text-sm">Todas as análises acontecem no seu navegador</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h4 className="font-bold text-blue-800">Dados Temporários</h4>
                  <p className="text-blue-700 text-sm">Informações apagadas automaticamente</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h4 className="font-bold text-blue-800">Zero Armazenamento</h4>
                  <p className="text-blue-700 text-sm">Nenhum dado fica em nossos servidores</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Informações Técnicas Mínimas</h2>
            <p>
              Para que nossa plataforma funcione corretamente, utilizamos apenas informações técnicas básicas e anônimas:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <h4 className="font-bold mb-2">📊 Dados Técnicos Anônimos:</h4>
              <ul className="space-y-1">
                <li>• Tipo de navegador (para compatibilidade)</li>
                <li>• Resolução de tela (para responsividade)</li>
                <li>• Estatísticas gerais de uso (sem identificação)</li>
                <li>• Logs de erro técnico (para melhorias)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Importante:</strong> Essas informações são totalmente anônimas e não podem ser 
                vinculadas a você de forma alguma.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies e Tecnologias Similares</h2>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2">🍪 Nossa Política de Cookies:</h4>
              <p className="text-yellow-700 mb-3">
                Utilizamos apenas cookies técnicos essenciais para o funcionamento da plataforma. 
                Nenhum cookie de rastreamento ou marketing é utilizado.
              </p>
              <div className="text-sm text-yellow-600">
                <strong>Cookies que usamos:</strong>
                <ul className="ml-4 mt-1">
                  <li>• Preferências de tema (claro/escuro)</li>
                  <li>• Configurações de idioma</li>
                  <li>• Estado da sessão técnica</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Segurança da Plataforma</h2>
            <p>
              Mesmo não coletando dados, levamos a segurança muito a sério:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🔒 Protocolos de Segurança:</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Conexão HTTPS criptografada</li>
                  <li>• Código auditado regularmente</li>
                  <li>• Infraestrutura protegida</li>
                  <li>• Atualizações constantes</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">🛡️ Sua Proteção:</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Anonimato total garantido</li>
                  <li>• Sem rastreamento entre sites</li>
                  <li>• Processamento local seguro</li>
                  <li>• Transparência total</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seus Direitos</h2>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <p className="text-indigo-800 mb-4">
                Como não coletamos dados pessoais, você automaticamente tem todos os direitos de privacidade garantidos:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">✅ Direitos Automáticos:</h4>
                  <ul className="text-indigo-700 text-sm space-y-1">
                    <li>• Não há dados para solicitar</li>
                    <li>• Não há dados para excluir</li>
                    <li>• Não há dados para corrigir</li>
                    <li>• Não há dados para portar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-800 mb-2">🎯 Nosso Compromisso:</h4>
                  <ul className="text-indigo-700 text-sm space-y-1">
                    <li>• Transparência total</li>
                    <li>• Anonimato garantido</li>
                    <li>• Controle total para você</li>
                    <li>• Privacidade por design</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Alterações nesta Política</h2>
            <p>
              Se precisarmos atualizar esta política (sempre mantendo nosso compromisso com sua privacidade), 
              notificaremos você através da própria plataforma. Qualquer mudança será sempre em direção a 
              <strong>mais privacidade</strong>, nunca menos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contato</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-blue-800 mb-3">
                Tem dúvidas sobre nossa política de privacidade? Estamos aqui para esclarecer!
              </p>
              <p className="text-blue-700">
                Entre em contato através da nossa página de suporte. Responderemos rapidamente e 
                com total transparência sobre nossos processos de privacidade.
              </p>
              <p className="mt-3 text-blue-600 font-medium">
                🌟 <strong>Lembre-se:</strong> Sua privacidade é nossa prioridade número 1!
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
// ===========================================  
// FIM de src/app/privacidade/page.tsx  
// ===========================================