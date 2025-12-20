// src/services/api.ts

// ---
// SERVIÇOS DE API
// ---

// Buscar dados históricos
export const fetchHistoricalData = async () => { // 1. Removemos o parâmetro 'limit' da função
  try {
    // 2. Removemos o parâmetro `limit` da URL da API
    const response = await fetch(`/api/resultados`); 
    
    if (!response.ok) {
      throw new Error('Falha ao buscar dados históricos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Verificar sessão do usuário
export const checkUserSession = async () => {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Falha na autenticação');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na sessão:', error);
    throw error;
  }
};