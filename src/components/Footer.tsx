// Em Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-white py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo e nome */}
          <div className="mb-6 md:mb-0 flex items-center">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-2 mr-3">
              <Image 
                src="/logo1.png" 
                alt="Logo VOXStrategies" 
                width={40} 
                height={40} 
                className="opacity-90"
              />
            </div>
            <div>
              <span className="text-lg font-bold">VOX<span className="text-blue-500">Strategies</span></span>
              <p className="text-sm text-gray-400">Desperte o poder da sua sorte</p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-6 md:mb-0">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Seu Sucesso</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/gerador-inteligente" className="text-gray-400 hover:text-blue-400 transition">Gerador da Sorte</Link>
                </li>
                <li>
                  <Link href="/estatisticas" className="text-gray-400 hover:text-blue-400 transition">Insights Vencedores</Link>
                </li>
                <li>
                  <Link href="/resultados" className="text-gray-400 hover:text-blue-400 transition">Histórias de Vitória</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Sempre Aqui</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contato" className="text-gray-400 hover:text-blue-400 transition">Fale Conosco</Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-blue-400 transition">Dúvidas Frequentes</Link>
                </li>
                <li>
                  <Link href="/metodologia" className="text-gray-400 hover:text-blue-400 transition">Nossa Fórmula</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Transparência</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition">Termos de Uso</Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition">Sua Privacidade</Link>
                </li>
                <li>
                  <Link href="/responsabilidade" className="text-gray-400 hover:text-blue-400 transition">Jogue com Sabedoria</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Junte-se a Nós</h3>
            <div className="flex space-x-4">
              <Link href="https://twitter.com/voxstrategies" target="_blank" aria-label="Twitter" className="bg-gray-800 border border-gray-700 p-2 rounded-full hover:bg-blue-500 hover:border-blue-500 transition">
                <FaTwitter className="h-5 w-5" />
              </Link>
              <Link href="https://facebook.com/voxstrategies" target="_blank" aria-label="Facebook" className="bg-gray-800 border border-gray-700 p-2 rounded-full hover:bg-blue-600 hover:border-blue-600 transition">
                <FaFacebook className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com/voxstrategies" target="_blank" aria-label="Instagram" className="bg-gray-800 border border-gray-700 p-2 rounded-full hover:bg-gradient-to-r from-purple-500 to-pink-500 hover:border-transparent transition">
                <FaInstagram className="h-5 w-5" />
              </Link>
              <Link href="https://github.com/voxstrategies" target="_blank" aria-label="GitHub" className="bg-gray-800 border border-gray-700 p-2 rounded-full hover:bg-gray-700 transition">
                <FaGithub className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright e Disclaimer */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p className="mb-3 text-base font-medium text-white">🍀 Transforme sua sorte em estratégia vencedora</p>
          <p className="mb-2">© {new Date().getFullYear()} VOXStrategies. Todos os direitos reservados.</p>
          <p className="text-xs leading-relaxed max-w-4xl mx-auto">
            Descubra o segredo dos vencedores! Nossa tecnologia inteligente analisa padrões únicos para maximizar suas chances de sucesso.
            Potencialize sua sorte natural com estratégias comprovadas e conquiste os resultados que você merece.
            Milhares já transformaram seus jogos - chegou a sua vez de brilhar! ✨
          </p>
        </div>
      </div>
    </footer>
  );
}