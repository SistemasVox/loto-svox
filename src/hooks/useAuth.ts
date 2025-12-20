// ======================================================================
// CAMINHO DO ARQUIVO
// ======================================================================
// src/hooks/useAuth.ts

'use client'

// ======================================================================
// IMPORTS E DEPENDÊNCIAS
// ======================================================================
import { useState, useEffect } from 'react'

// ======================================================================
// INTERFACES E TIPOS
// ======================================================================
interface AuthState {
  isLoggedIn: boolean    // indica se o usuário está logado
  user: any | null       // dados do usuário ou null caso não haja sessão
  loading: boolean       // estado de carregamento da verificação
}

// ======================================================================
// HOOK PRINCIPAL
// ======================================================================
export const useAuth = (): AuthState => {
  // ====================================================================
  // STATE
  // ====================================================================
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
  })

  // ====================================================================
  // EFFECT: checa autenticação no mount
  // ====================================================================
  useEffect(() => {
    // Função que faz a requisição de sessão
    const checkAuth = async () => {
      try {
        console.log('[useAuth] Verificando autenticação…')

        const response = await fetch('/api/auth/session', {
          credentials: 'include', // envia cookie de sessão
          cache: 'no-store',      // sempre busca do servidor
        })
        console.log(`[useAuth] Status da resposta: ${response.status}`)

        if (!response.ok) {
          // se status for != 200
          throw new Error('Falha na autenticação')
        }

        const data = await response.json()
        console.log('[useAuth] Dados da sessão:', data)

        // next-auth retorna { user, expires }
        if (data.user) {
          setAuthState({
            isLoggedIn: true,
            user: data.user,
            loading: false,
          })
        } else {
          setAuthState({
            isLoggedIn: false,
            user: null,
            loading: false,
          })
        }
      } catch (error) {
        console.error('[useAuth] Erro ao verificar autenticação:', error)
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
        })
      }
    }

    // executa apenas uma vez ao montar
    checkAuth()
  }, [])

  // ====================================================================
  // RETORNO DO HOOK
  // ====================================================================
  return authState
}
