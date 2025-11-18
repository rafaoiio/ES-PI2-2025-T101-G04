// LAURA
// Gerenciador da página de recuperação de senha
class ForgotPasswordManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showToast = this.showToast.bind(this);
  }

  setupEventListeners() {
    const form = document.getElementById('forgotForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }

  async handleSubmit() {
    const email = document.getElementById('email').value;
    const submitBtn = document.getElementById('submitBtn');

    if (!email) {
      this.showToast('Por favor, digite seu endereço de e-mail', 'error');
      return;
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Por favor, digite um e-mail válido', 'error');
      return;
    }

    // Mostrar estado de loading
    this.showLoadingState();

    try {
      // Chama endpoint real do backend
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        this.showSuccessState();
      } else {
        const error = await response.json();
        this.showErrorState(error.message || 'Erro ao processar solicitação');
      }
    } catch (error) {
      console.error('Erro:', error);
      this.showErrorState('Erro ao conectar com o servidor. Tente novamente.');
    }
  }

  showLoadingState() {
    const initialState = document.getElementById('initial-state');
    const loadingState = document.getElementById('loading-state');

    if (initialState && loadingState) {
      initialState.classList.add('hidden');
      loadingState.classList.remove('hidden');
    }
  }

  showSuccessState() {
    const loadingState = document.getElementById('loading-state');
    const successState = document.getElementById('success-state');

    if (loadingState && successState) {
      loadingState.classList.add('hidden');
      successState.classList.remove('hidden');
    }
  }

  showErrorState(message) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');

    if (loadingState && errorState && errorMessage) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = message;
    }
  }

  resetToInitial() {
    const errorState = document.getElementById('error-state');
    const initialState = document.getElementById('initial-state');

    if (errorState && initialState) {
      errorState.classList.add('hidden');
      initialState.classList.remove('hidden');

      // Limpar formulário
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = '';
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Auto-remover após 4 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);

    // Animação de entrada
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'transform 0.3s ease-out';

      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      });
    });
  }
}

// Instância global para permitir acesso aos métodos
let forgotPasswordManagerInstance = null;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  forgotPasswordManagerInstance = new ForgotPasswordManager();
});

// Função global para reset (usada no HTML)
window.resetToInitial = function() {
  if (forgotPasswordManagerInstance) {
    forgotPasswordManagerInstance.resetToInitial();
  }
};
