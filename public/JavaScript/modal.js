// LUCAS
/**
 * Modal Manager - Sistema de Gerenciamento de Modais
 * 
 * Gerencia abertura, fechamento e interações com modais de forma centralizada.
 */

class ModalManager {
  constructor(modalId) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isOpen = false;
    this.onCloseCallback = null;
    
    if (this.modal) {
      this.setupEventListeners();
    }
  }

  /**
   * Configura event listeners do modal.
   */
  setupEventListeners() {
    // Fechar ao clicar no overlay
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Botão de fechar
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Botão cancelar
    const cancelBtn = this.modal.querySelector('.modal-btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close());
    }
  }

  /**
   * Abre o modal.
   */
  open() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      
      // Foca no primeiro input
      setTimeout(() => {
        const firstInput = this.modal.querySelector('input:not([type="hidden"]), select, textarea');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  /**
   * Fecha o modal.
   */
  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      this.isOpen = false;
      document.body.style.overflow = '';
      
      // Limpa o formulário
      const form = this.modal.querySelector('form');
      if (form) {
        form.reset();
        
        // Remove classes de erro
        form.querySelectorAll('.error, .success').forEach(el => {
          el.classList.remove('error', 'success');
        });
      }
      
      // Callback de fechamento
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    }
  }

  /**
   * Define callback para quando o modal fechar.
   */
  onClose(callback) {
    this.onCloseCallback = callback;
  }

  /**
   * Define título do modal.
   */
  setTitle(title) {
    const titleEl = this.modal.querySelector('.modal-header h2');
    if (titleEl) {
      const icon = titleEl.querySelector('.modal-header-icon');
      titleEl.textContent = title;
      if (icon) {
        titleEl.prepend(icon);
      }
    }
  }

  /**
   * Preenche formulário com dados.
   */
  fillForm(data) {
    const form = this.modal.querySelector('form');
    if (!form) return;

    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = data[key] || '';
      }
    });
  }

  /**
   * Obtém dados do formulário.
   */
  getFormData() {
    const form = this.modal.querySelector('form');
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  /**
   * Valida formulário.
   */
  validateForm() {
    const form = this.modal.querySelector('form');
    if (!form) return true;

    let isValid = true;

    // Remove erros anteriores
    form.querySelectorAll('.error').forEach(el => {
      el.classList.remove('error');
    });

    // Valida campos obrigatórios
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value || input.value.trim() === '') {
        input.classList.add('error');
        isValid = false;
      }
    });

    // Valida emails
    form.querySelectorAll('[type="email"]').forEach(input => {
      if (input.value && !this.isValidEmail(input.value)) {
        input.classList.add('error');
        isValid = false;
      }
    });

    // Valida números
    form.querySelectorAll('[type="number"]').forEach(input => {
      if (input.value && isNaN(input.value)) {
        input.classList.add('error');
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Valida email.
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Mostra loading no botão de submit.
   */
  showButtonLoading(show = true) {
    const submitBtn = this.modal.querySelector('.modal-btn-submit');
    if (!submitBtn) return;

    const text = submitBtn.querySelector('.btn-text') || submitBtn;
    const spinner = submitBtn.querySelector('.modal-btn-spinner');

    if (show) {
      submitBtn.disabled = true;
      if (text) text.textContent = 'Salvando...';
      if (spinner) spinner.style.display = 'block';
    } else {
      submitBtn.disabled = false;
      if (text) text.textContent = 'Salvar';
      if (spinner) spinner.style.display = 'none';
    }
  }

  /**
   * Mostra erro no campo.
   */
  showFieldError(fieldName, message) {
    const input = this.modal.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.classList.add('error');
    
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('modal-form-error')) {
      errorEl = document.createElement('div');
      errorEl.className = 'modal-form-error';
      input.parentNode.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  /**
   * Limpa erros do formulário.
   */
  clearErrors() {
    const form = this.modal.querySelector('form');
    if (!form) return;

    form.querySelectorAll('.error').forEach(el => {
      el.classList.remove('error');
    });

    form.querySelectorAll('.modal-form-error').forEach(el => {
      el.style.display = 'none';
    });
  }
}

/**
 * Cria e retorna uma nova instância de ModalManager.
 */
function createModal(modalId) {
  return new ModalManager(modalId);
}

// Exporta para uso global
if (typeof window !== 'undefined') {
  window.ModalManager = ModalManager;
  window.createModal = createModal;
}