// VITOR
/**
 * Gerenciador completo do Dashboard.
 * 
 * Gerencia navegação, carregamento de dados, autenticação e todas
 * as funcionalidades do dashboard principal.
 */

class DashboardManager {
  constructor() {
    this.currentView = 'overview';
    this.metrics = null;
    this.user = null;
    this.init();
  }

  /**
   * Inicializa o dashboard.
   */
  async init() {
    this.checkAuth();
    this.setupNavigation();
    this.setupEventListeners();
    await this.loadUserInfo(); // CRÍTICO: Aguarda carregar dados do usuário do servidor
    await this.loadMetrics();
    this.setupMobileMenu();
  }

  /**
   * Verifica autenticação e redireciona se necessário.
   */
  checkAuth() {
    const token = localStorage.getItem('notadez_token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
  }

  /**
   * Configura navegação entre views.
   */
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = link.getAttribute('data-view');
        this.showView(viewName);
      });
    });

    // Carrega view inicial da URL ou usa 'overview'
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.showView(hash);
    } else {
      this.showView('overview');
    }
  }

  /**
   * Mostra uma view específica.
   */
  showView(viewName) {
    // Atualiza links ativos
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      }
    });

    // Esconde todas as views
    document.querySelectorAll('.content-view').forEach(view => {
      view.classList.remove('active');
    });

    // Mostra view selecionada
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
      this.updatePageTitle(viewName);
      this.loadViewData(viewName);
      
      // Atualiza URL sem recarregar página
      window.history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    // Fecha sidebar mobile se estiver aberto
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
  }

  /**
   * Atualiza título e descrição da página.
   */
  updatePageTitle(viewName) {
    const titles = {
      overview: { title: 'Visão Geral', description: 'Bem-vindo ao sistema de gestão de notas' },
      institutions: { title: 'Instituições', description: 'Gerencie as instituições onde você leciona' },
      courses: { title: 'Cursos', description: 'Gerencie os cursos das suas instituições' },
      disciplines: { title: 'Disciplinas', description: 'Gerencie as disciplinas dos seus cursos' },
      classes: { title: 'Turmas', description: 'Gerencie as turmas das suas disciplinas' },
      students: { title: 'Alunos', description: 'Gerencie os alunos das suas turmas' },
      grades: { title: 'Notas', description: 'Gerencie o lançamento e visualização de notas' }
    };

    const pageInfo = titles[viewName] || titles.overview;
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (pageTitle) pageTitle.textContent = pageInfo.title;
    if (pageDescription) pageDescription.textContent = pageInfo.description;
  }

  /**
   * Carrega dados específicos da view.
   */
  async loadViewData(viewName) {
    switch (viewName) {
      case 'overview':
        await this.loadMetrics();
        this.updateRecentActivity();
        break;
      case 'institutions':
        await this.loadInstitutions();
        break;
      default:
        // Outras views não precisam carregar dados adicionais
        break;
    }
  }

/**
 * Carrega e exibe as métricas do sistema.
 */
  async loadMetrics() {
  try {
    showLoading();
    const metrics = await apiGet('/dashboard/metrics');
      this.metrics = metrics;
    
      // Atualiza contadores
    const disciplinasCount = document.getElementById('disciplinasCount');
    const turmasCount = document.getElementById('turmasCount');
    const componentesCount = document.getElementById('componentesCount');
    const alunosCount = document.getElementById('alunosCount');

    if (disciplinasCount) disciplinasCount.textContent = metrics.disciplinas || 0;
    if (turmasCount) turmasCount.textContent = metrics.turmas || 0;
    if (componentesCount) componentesCount.textContent = metrics.componentes || 0;
    if (alunosCount) alunosCount.textContent = metrics.alunos || 0;

      // Adiciona animação aos números
      this.animateNumbers();
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
    showToast('Erro ao carregar métricas do dashboard', 'error');
    
      // Fallback: exibir zeros
    const disciplinasCount = document.getElementById('disciplinasCount');
    const turmasCount = document.getElementById('turmasCount');
    const componentesCount = document.getElementById('componentesCount');
    const alunosCount = document.getElementById('alunosCount');
    
    if (disciplinasCount) disciplinasCount.textContent = '0';
    if (turmasCount) turmasCount.textContent = '0';
    if (componentesCount) componentesCount.textContent = '0';
    if (alunosCount) alunosCount.textContent = '0';
  } finally {
    hideLoading();
  }
}

  /**
   * Anima números ao carregar.
   */
  animateNumbers() {
    const counters = document.querySelectorAll('.stat-info h3');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent);
      if (target > 0) {
        let current = 0;
        const increment = target / 20;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current);
          }
        }, 30);
      }
    });
  }

  /**
   * Atualiza seção de atividade recente.
   */
  updateRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    // Por enquanto mostra mensagem genérica
    // Futuramente pode carregar atividades reais do backend
    if (this.metrics) {
      const total = (this.metrics.disciplinas || 0) + 
                    (this.metrics.turmas || 0) + 
                    (this.metrics.componentes || 0) + 
                    (this.metrics.alunos || 0);
      
      if (total === 0) {
        activityList.innerHTML = `
          <div class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="activity-content">
              <p>Nenhuma atividade recente</p>
              <span class="activity-time">Comece adicionando instituições e cursos</span>
            </div>
          </div>
        `;
      } else {
        activityList.innerHTML = `
          <div class="activity-item">
            <div class="activity-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div class="activity-content">
              <p>Sistema ativo</p>
              <span class="activity-time">${total} itens cadastrados no sistema</span>
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Carrega lista de instituições.
   */
  async loadInstitutions() {
    try {
      showLoading();
      const institutions = await apiGet('/instituicoes');
      this.renderInstitutions(institutions);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      showToast('Erro ao carregar instituições', 'error');
      this.showInstitutionsEmpty();
    } finally {
      hideLoading();
    }
  }

  /**
   * Renderiza lista de instituições.
   */
  renderInstitutions(institutions) {
    const grid = document.getElementById('institutionsGrid');
    const empty = document.getElementById('institutionsEmpty');
    
    if (!grid || !empty) return;

    if (!institutions || institutions.length === 0) {
      this.showInstitutionsEmpty();
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = institutions.map(inst => `
      <div class="institution-card">
        <div class="institution-header">
          <h3 class="institution-name">${this.escapeHtml(inst.nome || 'Sem nome')}</h3>
          <p class="institution-address">${this.escapeHtml(inst.endereco || 'Endereço não informado')}</p>
          <span class="institution-badge">Ativa</span>
        </div>
        <div class="institution-content">
          ${inst.descricao ? `<p class="institution-description">${this.escapeHtml(inst.descricao)}</p>` : ''}
          <div class="institution-actions">
            <a href="/instituicoes.html" class="btn-edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Mostra estado vazio de instituições.
   */
  showInstitutionsEmpty() {
    const grid = document.getElementById('institutionsGrid');
    const empty = document.getElementById('institutionsEmpty');
    
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
  }

  /**
   * Carrega informações do usuário logado.
   * CRÍTICO: Sempre recarrega do servidor para garantir que os dados pertencem ao usuário atual.
   */
  async loadUserInfo() {
    try {
      // CRÍTICO: Sempre recarrega do servidor para garantir consistência
      // Não confia apenas no localStorage que pode conter dados de outro usuário
      const userData = await apiGet('/auth/me');
      this.user = userData;
      
      // Atualiza localStorage com dados validados do servidor
      localStorage.setItem('notadez_user', JSON.stringify(userData));
      
      const userName = document.getElementById('userName');
      const userEmail = document.getElementById('userEmail');
      const welcomeName = document.getElementById('welcomeName');

      if (userName) {
        userName.textContent = userData.nome || userData.email || 'Usuário';
      }
      if (userEmail) {
        userEmail.textContent = userData.email || '';
      }
      if (welcomeName) {
        welcomeName.textContent = userData.nome || userData.email || 'Professor';
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Fallback: tenta usar localStorage apenas se a requisição falhar
    const userStr = localStorage.getItem('notadez_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const welcomeName = document.getElementById('welcomeName');

        if (userName) {
          userName.textContent = this.user.nome || this.user.email || 'Usuário';
        }
        if (userEmail) {
          userEmail.textContent = this.user.email || '';
        }
        if (welcomeName) {
          welcomeName.textContent = this.user.nome || this.user.email || 'Professor';
        }
      } catch (e) {
        console.error('Erro ao parsear dados do usuário:', e);
        }
      }
    }
  }

  /**
   * Configura event listeners gerais.
   */
  setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Botão adicionar instituição
    const addInstitutionBtn = document.getElementById('addInstitutionBtn');
    if (addInstitutionBtn) {
      addInstitutionBtn.addEventListener('click', () => {
        window.location.href = '/instituicoes.html';
      });
    }

    // Formulário de instituição (se existir)
    const institutionForm = document.getElementById('institutionForm');
    if (institutionForm) {
      institutionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddInstitution(e.target);
      });
    }

    // Navegação pelo histórico do browser
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.showView(e.state.view);
      }
    });
  }

  /**
   * Gerencia logout.
   */
  handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('notadez_token');
      localStorage.removeItem('notadez_user');
      window.location.href = '/login.html';
    }
  }

  /**
   * Gerencia adição de instituição (redireciona para página específica).
   */
  handleAddInstitution(form) {
    window.location.href = '/instituicoes.html';
  }

  /**
   * Configura menu mobile.
   */
  setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // Fecha sidebar ao clicar fora
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  /**
   * Escapa HTML para prevenir XSS.
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inicializa dashboard quando DOM estiver pronto
let dashboardManager = null;

document.addEventListener('DOMContentLoaded', () => {
  dashboardManager = new DashboardManager();
});

// Funções globais para compatibilidade com HTML inline
window.showAddInstitutionDialog = function() {
  window.location.href = '/instituicoes.html';
};

window.closeModal = function() {
  const modal = document.getElementById('institutionModal');
  if (modal) {
    modal.classList.remove('show');
  }
};
