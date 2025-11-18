// VITOR
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

/**
 * Wrapper para chamadas à API REST.
 * 
 * Centraliza a lógica de autenticação, tratamento de erros e redirecionamento,
 * evitando duplicação de código em todas as páginas.
 * 
 * Comportamentos implementados:
 * - Injeção automática de token JWT do localStorage
 * - Redirecionamento automático para login em caso de 401
 * - Propagação de erros 409 (Conflict) com detalhes para tratamento específico
 * - Tratamento genérico de outros erros HTTP
 */

/**
 * Realiza requisição GET à API.
 * 
 * @param {string} url - Endpoint relativo (ex: '/disciplinas')
 * @returns {Promise<any>} Dados JSON da resposta
 * @throws {Error} Em caso de erro HTTP ou 401 (redireciona para login)
 */
async function apiGet(url) {
  // Verifica se API_BASE_URL está definido
  if (typeof API_BASE_URL === 'undefined') {
    console.error('[API] API_BASE_URL não está definido!');
    throw new Error('API_BASE_URL não está definido. Verifique se /js/env.js está carregado antes deste script.');
  }

  const token = localStorage.getItem('notadez_token');
  const headers = {
    'Content-Type': 'application/json',
    // CRÍTICO: Headers de cache-control para evitar cache entre usuários diferentes
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  // Inclui token apenas se existir (permite rotas públicas)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('[API] GET:', fullUrl, { headers: { ...headers, Authorization: token ? 'Bearer ***' : 'none' } });

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers,
  });

  console.log('[API] Resposta:', response.status, response.statusText);

  // 401: token inválido ou expirado → força novo login
  // Remove token para evitar loops de redirecionamento
  if (response.status === 401) {
    console.error('[API] Não autorizado (401)');
    localStorage.removeItem('notadez_token');
    window.location.href = '/login.html';
    throw new Error('Não autorizado');
  }

  if (!response.ok) {
    // Tenta parsear erro como JSON, fallback para mensagem genérica
    // Evita quebrar se o servidor retornar HTML de erro
    let error;
    try {
      const errorText = await response.text();
      console.error('[API] Erro recebido:', errorText);
      error = JSON.parse(errorText);
    } catch (e) {
      error = { message: `Erro ${response.status}: ${response.statusText}` };
    }
    throw error;
  }

  const data = await response.json();
  console.log('[API] Dados recebidos:', data);
  return data;
}

/**
 * Realiza requisição POST à API.
 * 
 * @param {string} url - Endpoint relativo
 * @param {object} data - Dados a serem enviados (serão serializados como JSON)
 * @returns {Promise<any>} Dados JSON da resposta
 * @throws {Error} Em caso de erro HTTP, 401 ou 409
 */
async function apiPost(url, data) {
  const token = localStorage.getItem('notadez_token');
  const headers = {
    'Content-Type': 'application/json',
    // CRÍTICO: Headers de cache-control para evitar cache entre usuários diferentes
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    localStorage.removeItem('notadez_token');
    window.location.href = '/login.html';
    throw new Error('Não autorizado');
  }

  // 409: conflito de regra de negócio (ex: matrícula duplicada, componente com notas)
  // Propaga erro completo para permitir tratamento específico no frontend
  if (response.status === 409) {
    const error = await response.json();
    throw error;
  }

  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      error = JSON.parse(errorText);
    } catch (e) {
      error = { message: `Erro ${response.status}: ${response.statusText}` };
    }
    throw error;
  }

  return response.json();
}

/**
 * Realiza requisição PATCH à API.
 * 
 * Mesma lógica do POST, mas para atualização parcial de recursos.
 */
async function apiPatch(url, data) {
  const token = localStorage.getItem('notadez_token');
  const headers = {
    'Content-Type': 'application/json',
    // CRÍTICO: Headers de cache-control para evitar cache entre usuários diferentes
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    localStorage.removeItem('notadez_token');
    window.location.href = '/login.html';
    throw new Error('Não autorizado');
  }

  if (response.status === 409) {
    const error = await response.json();
    throw error;
  }

  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      error = JSON.parse(errorText);
    } catch (e) {
      error = { message: `Erro ${response.status}: ${response.statusText}` };
    }
    throw error;
  }

  return response.json();
}

/**
 * Realiza requisição DELETE à API.
 * 
 * Trata 204 (No Content) como sucesso sem corpo de resposta,
 * comum em operações de exclusão RESTful.
 */
async function apiDelete(url) {
  const token = localStorage.getItem('notadez_token');
  const headers = {
    'Content-Type': 'application/json',
    // CRÍTICO: Headers de cache-control para evitar cache entre usuários diferentes
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('notadez_token');
    window.location.href = '/login.html';
    throw new Error('Não autorizado');
  }

  if (response.status === 409) {
    const error = await response.json();
    throw error;
  }

  if (!response.ok) {
    let error;
    try {
      const errorText = await response.text();
      error = JSON.parse(errorText);
    } catch (e) {
      error = { message: `Erro ${response.status}: ${response.statusText}` };
    }
    throw error;
  }

  // 204 No Content: exclusão bem-sucedida sem corpo de resposta
  if (response.status === 204) {
    return;
  }

  return response.json();
}
