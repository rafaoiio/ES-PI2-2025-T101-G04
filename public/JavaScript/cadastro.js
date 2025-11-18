// LAURA
// Gerenciador Avançado da Página de Cadastro
class RegisterManager {
  constructor() {
    this.passwordStrength = { score: 0, feedback: 'Senha fraca' };
    this.validation = {
      name: false,
      email: false,
      phone: false,
      institution: false,
      password: false,
      confirmPassword: false,
      terms: false
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupRealTimeValidation();
    this.showToast = this.showToast.bind(this);
  }

  setupEventListeners() {
    const form = document.getElementById('registerForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Validação em tempo real
    const inputs = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => this.validateField(id));
        input.addEventListener('blur', () => this.validateField(id));
      }
    });

    // Checkbox de termos
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', () => {
        this.validation.terms = termsCheckbox.checked;
        this.updateFormValidity();
      });
    }

    // Select de instituição
    const institutionSelect = document.getElementById('institution');
    if (institutionSelect) {
      institutionSelect.addEventListener('change', () => {
        this.validateField('institution');
      });
    }
  }

  setupRealTimeValidation() {
    // Monitorar senha para força
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.updatePasswordStrength(passwordInput.value);
      });
    }

    // Monitorar confirmação de senha
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
    }
  }

  validateField(fieldId) {
    const value = document.getElementById(fieldId)?.value || '';
    let isValid = false;

    switch (fieldId) {
      case 'name':
        isValid = value.length >= 2;
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'phone':
        isValid = value.length >= 10;
        break;
      case 'institution':
        isValid = value !== '';
        break;
      case 'password':
        isValid = value.length >= 8;
        break;
      case 'confirmPassword':
        const password = document.getElementById('password')?.value || '';
        isValid = value === password && value.length >= 8;
        break;
    }

    this.validation[fieldId] = isValid;
    this.updateFieldVisual(fieldId, isValid);
    this.updateFormValidity();

    return isValid;
  }

  updateFieldVisual(fieldId, isValid) {
    const formGroup = document.getElementById(fieldId)?.closest('.form-group');
    if (formGroup) {
      formGroup.classList.toggle('valid', isValid);
      formGroup.classList.toggle('invalid', !isValid && document.getElementById(fieldId)?.value);
    }
  }

  updatePasswordStrength(password) {
    let score = 0;
    let feedback = 'Senha muito fraca';

    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    if (score >= 90) feedback = 'Senha muito forte';
    else if (score >= 75) feedback = 'Senha forte';
    else if (score >= 50) feedback = 'Senha média';
    else if (score >= 25) feedback = 'Senha fraca';

    this.passwordStrength = { score, feedback };

    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (strengthFill && strengthText) {
      strengthFill.className = 'strength-fill';

      if (score >= 75) strengthFill.classList.add('strong');
      else if (score >= 50) strengthFill.classList.add('medium');
      else if (score >= 25) strengthFill.classList.add('weak');

      strengthText.className = 'strength-text';
      if (score >= 75) strengthText.classList.add('strong');
      else if (score >= 50) strengthText.classList.add('medium');
      else if (score >= 25) strengthText.classList.add('weak');

      strengthText.textContent = feedback;
    }
  }

  validatePasswordMatch() {
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    this.validation.confirmPassword = password === confirmPassword && password.length >= 8;
    this.updateFieldVisual('confirmPassword', this.validation.confirmPassword);
  }

  updateFormValidity() {
    const allValid = Object.values(this.validation).every(valid => valid);
    const registerBtn = document.getElementById('registerBtn');

    if (registerBtn) {
      registerBtn.disabled = !allValid;
      registerBtn.style.opacity = allValid ? '1' : '0.6';
    }
  }

  async handleRegister() {
    const registerBtn = document.getElementById('registerBtn');

    if (!Object.values(this.validation).every(valid => valid)) {
      this.showToast('Por favor, corrija os campos destacados', 'error');
      return;
    }

    // Mostrar estado de loading
    this.showLoadingState();

    try {
      const nome = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const telefone = document.getElementById('phone').value;
      const senha = document.getElementById('password').value;

      // API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          senha
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao criar conta' }));
        this.showErrorState(errorData.message || 'E-mail já cadastrado no sistema');
        return;
      }

      await response.json();
      this.showSuccessState();
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      this.showErrorState('Erro interno do servidor. Tente novamente.');
    }
  }

  showLoadingState() {
    const registerState = document.getElementById('register-state');
    const loadingState = document.getElementById('loading-state');

    if (registerState && loadingState) {
      registerState.classList.add('hidden');
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

  resetToRegister() {
    const errorState = document.getElementById('error-state');
    const registerState = document.getElementById('register-state');

    if (errorState && registerState) {
      errorState.classList.add('hidden');
      registerState.classList.remove('hidden');

      // Limpar formulário
      const form = document.getElementById('registerForm');
      if (form) {
        form.reset();
      }

      // Resetar validações
      Object.keys(this.validation).forEach(key => {
        this.validation[key] = false;
        this.updateFieldVisual(key, false);
      });

      this.updateFormValidity();
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
let registerManagerInstance = null;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  registerManagerInstance = new RegisterManager();
});

// Função global para reset (usada no HTML)
window.resetToRegister = function() {
  if (registerManagerInstance) {
    registerManagerInstance.resetToRegister();
  }
};
