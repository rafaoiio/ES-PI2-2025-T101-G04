// LAURA
// Verifica se o usuário está autenticado antes de carregar páginas protegidas
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

function checkAuth() {
  const token = localStorage.getItem('notadez_token');
  
  if (!token) {
    // Se não tem token, redireciona para login
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

// Verifica autenticação ao carregar a página
(function() {
  // Páginas que não precisam de autenticação
  const publicPages = ['/login.html', '/cadastro', '/esqueci'];
  const currentPath = window.location.pathname;
  const token = localStorage.getItem('notadez_token');
  
  // Se está na rota raiz "/", redireciona para login (se não autenticado) ou dashboard (se autenticado)
  if (currentPath === '/' || currentPath === '') {
    if (token) {
      window.location.href = '/index.html';
    } else {
      window.location.href = '/login.html';
    }
    return;
  }
  
  // Se está em página pública (login, cadastro, etc)
  const isPublicPage = publicPages.some(page => currentPath.includes(page));
  
  if (isPublicPage) {
    // Se já está autenticado e tentando acessar login, redireciona para dashboard
    if (token && currentPath.includes('/login.html')) {
      window.location.href = '/index.html';
      return;
    }
  } else {
    // Se não é página pública, verifica autenticação
    if (!checkAuth()) {
      // checkAuth já redireciona
      return;
    }
    
    // Páginas relacionadas à configuração inicial - permitir acesso livre
    const configPages = [
      '/primeiro-acesso.html',
      '/instituicoes.html',
      '/cursos.html'
    ];
    const isConfigPage = configPages.some(page => currentPath.includes(page));
    
    // Se está autenticado e não está em página de configuração, verifica primeiro acesso
    // Mas só redireciona se estiver tentando acessar o dashboard ou outras páginas principais
    if (token && !isConfigPage) {
      // Lista de páginas que devem ser bloqueadas se for primeiro acesso
      const blockedPages = [
        '/index.html',
        '/dashboard',
        '/disciplinas.html',
        '/componentes.html',
        '/turmas.html',
        '/alunos.html',
        '/notas.html',
        '/perfil.html'
      ];
      
      const shouldBlock = blockedPages.some(page => currentPath.includes(page));
      
      if (shouldBlock) {
        // Verifica primeiro acesso de forma assíncrona após um pequeno delay
        setTimeout(() => {
          checkFirstAccessRedirect();
        }, 100);
      }
    }
  }
})();

// Verifica se precisa redirecionar para primeiro acesso (não bloqueia carregamento)
// Esta função só redireciona se realmente necessário e não cria loops
let isCheckingFirstAccess = false;
let lastFirstAccessCheck = null;
const FIRST_ACCESS_CHECK_INTERVAL = 5000; // 5 segundos entre verificações

async function checkFirstAccessRedirect() {
  // Evita múltiplas verificações simultâneas
  if (isCheckingFirstAccess) return;
  
  // Evita verificar muito frequentemente
  const now = Date.now();
  if (lastFirstAccessCheck && (now - lastFirstAccessCheck) < FIRST_ACCESS_CHECK_INTERVAL) {
    return;
  }
  
  try {
    isCheckingFirstAccess = true;
    lastFirstAccessCheck = now;
    
    const token = localStorage.getItem('notadez_token');
    if (!token) {
      isCheckingFirstAccess = false;
      return;
    }
    
    const currentPath = window.location.pathname;
    
    // Não redireciona se já está em páginas de configuração
    const configPages = ['/primeiro-acesso.html', '/instituicoes.html', '/cursos.html'];
    if (configPages.some(page => currentPath.includes(page))) {
      isCheckingFirstAccess = false;
      return;
    }
    
    // Usa fetch diretamente para não depender da ordem de carregamento dos scripts
    const response = await fetch(`${typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : ''}/dashboard/first-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.isFirstAccess) {
        // Só redireciona se realmente não tem instituição ou curso
        // E se não está já na página de primeiro acesso
        if (!currentPath.includes('/primeiro-acesso.html')) {
          window.location.href = '/primeiro-acesso.html';
        }
      }
    }
  } catch (error) {
    // Se der erro, não bloqueia o acesso (pode ser problema de rede ou API não carregada ainda)
    console.warn('Erro ao verificar primeiro acesso:', error);
  } finally {
    isCheckingFirstAccess = false;
  }
}

// Função para fazer logout - disponível globalmente
function logout() {
  localStorage.removeItem('notadez_token');
  localStorage.removeItem('notadez_user');
  window.location.href = '/login.html';
}

// Torna a função logout disponível globalmente
window.logout = logout;

// Função para obter o token
function getAuthToken() {
  return localStorage.getItem('notadez_token');
}

// Função para obter dados do usuário
function getUserData() {
  const userStr = localStorage.getItem('notadez_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Função para fazer requisições autenticadas
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    window.location.href = '/login.html';
    throw new Error('Não autenticado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
  
  // Se token inválido ou expirado, redireciona para login
  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada');
  }
  
  return response;
}

