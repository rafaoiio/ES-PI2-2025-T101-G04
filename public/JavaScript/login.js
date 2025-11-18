// LAURA
class LoginManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showToast = this.showToast.bind(this);
  }

  setupEventListeners() {
    const form = document.getElementById('loginForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }

  async handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showToast('Por favor, preencha todos os campos', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Por favor, digite um e-mail válido', 'error');
      return;
    }

    this.showLoadingState();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao fazer login';
        let errorDetails = '';

        try {
          const errorData = await response.json();
          errorDetails =
            errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          errorDetails = await response
            .text()
            .catch(() => `HTTP ${response.status}: ${response.statusText}`);
        }

        if (response.status === 404) {
          errorMessage = `Rota não encontrada (404). Verifique se o servidor está rodando em ${API_BASE_URL}`;
        } else if (response.status === 401) {
          errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        } else if (response.status === 400) {
          errorMessage = `Dados inválidos: ${errorDetails}`;
        } else {
          errorMessage = `Erro ${response.status}: ${errorDetails}`;
        }

        this.showErrorState(errorMessage);
        return;
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error('Token não recebido do servidor');
      }

      // CRÍTICO: Limpa TODOS os dados do usuário anterior antes de salvar novos dados
      // Isso garante que não haja mistura de dados entre usuários diferentes
      localStorage.removeItem('notadez_token');
      localStorage.removeItem('notadez_user');
      
      // Limpa qualquer outro dado relacionado que possa estar em cache
      // Remove todos os itens do localStorage que começam com 'notadez_'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('notadez_')) {
          localStorage.removeItem(key);
        }
      });

      // Salva os novos dados do usuário atual
      localStorage.setItem('notadez_token', data.token);
      if (data.user) {
        localStorage.setItem('notadez_user', JSON.stringify(data.user));
      }

      this.showToast('Login realizado com sucesso!', 'success');

      // Verifica primeiro acesso após login
      setTimeout(async () => {
        try {
          const firstAccess = await apiGet('/dashboard/first-access');
          if (firstAccess.isFirstAccess) {
            window.location.href = '/primeiro-acesso.html';
          } else {
            window.location.href = '/index.html';
          }
        } catch (error) {
          // Se der erro, vai para dashboard mesmo assim
          console.error('Erro ao verificar primeiro acesso:', error);
          window.location.href = '/index.html';
        }
      }, 1000);
    } catch (error) {
      let errorMessage = 'Erro ao conectar com o servidor. ';

      if (typeof API_BASE_URL === 'undefined') {
        errorMessage +=
          'API_BASE_URL não está definida. Verifique se o arquivo /js/env.js está sendo carregado corretamente.';
      } else if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')
      ) {
        errorMessage += `Verifique se o servidor está rodando em ${API_BASE_URL}`;
      } else {
        errorMessage += error.message || 'Tente novamente mais tarde.';
      }

      this.showErrorState(errorMessage);
    }
  }

  showLoadingState() {
    const loginState = document.getElementById('login-state');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');

    // Esconde outros estados primeiro
    if (errorState) errorState.classList.add('hidden');
    if (loginState) {
      loginState.style.opacity = '0';
      setTimeout(() => {
        loginState.classList.add('hidden');
        loginState.style.opacity = '1';
      }, 150);
    }

    // Mostra loading com fade in
    if (loadingState) {
      loadingState.classList.remove('hidden');
      loadingState.style.opacity = '0';
      requestAnimationFrame(() => {
        loadingState.style.transition = 'opacity 0.3s ease';
        loadingState.style.opacity = '1';
      });
    }
  }

  showErrorState(message) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const loginState = document.getElementById('login-state');

    // Esconde outros estados
    if (loginState) loginState.classList.add('hidden');
    if (loadingState) {
      loadingState.style.opacity = '0';
      setTimeout(() => {
        loadingState.classList.add('hidden');
        loadingState.style.opacity = '1';
      }, 150);
    }

    // Mostra erro com fade in
    if (errorState && errorMessage) {
      errorMessage.textContent = message;
      errorState.classList.remove('hidden');
      errorState.style.opacity = '0';
      requestAnimationFrame(() => {
        errorState.style.transition = 'opacity 0.3s ease';
        errorState.style.opacity = '1';
      });
    }
  }

  resetToLogin() {
    const errorState = document.getElementById('error-state');
    const loginState = document.getElementById('login-state');
    const loadingState = document.getElementById('loading-state');

    // Esconde outros estados
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) {
      errorState.style.opacity = '0';
      setTimeout(() => {
        errorState.classList.add('hidden');
        errorState.style.opacity = '1';
      }, 150);
    }

    // Mostra formulário com fade in
    if (loginState) {
      loginState.classList.remove('hidden');
      loginState.style.opacity = '0';
      requestAnimationFrame(() => {
        loginState.style.transition = 'opacity 0.3s ease';
        loginState.style.opacity = '1';
      });

      // Limpa campos
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      if (emailInput) {
        emailInput.value = '';
        emailInput.focus();
      }
      if (passwordInput) passwordInput.value = '';
    }
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'transform 0.3s ease-out';
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });
    });
  }
}

let loginManagerInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loginManagerInstance = new LoginManager();
});

window.resetToLogin = function () {
  if (loginManagerInstance) {
    loginManagerInstance.resetToLogin();
  }
};
