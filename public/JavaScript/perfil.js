// LAURA
/**
 * Gerenciador de Perfil do Usuário.
 * 
 * Gerencia carregamento, edição e atualização dos dados do perfil.
 */

class ProfileManager {
  constructor() {
    this.user = null;
    this.isEditing = false;
    this.init();
  }

  /**
   * Inicializa o gerenciador de perfil.
   */
  async init() {
    this.checkAuth();
    this.setupEventListeners();
    this.setupMobileMenu();
    await this.loadProfile();
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
   * Configura event listeners.
   */
  setupEventListeners() {
    // Botão editar perfil
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.startEditing());
    }

    // Botão fechar edição
    const closeBtn = document.getElementById('closeEditBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.cancelEditing());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelEditing());

    // Formulário de edição
    const form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Máscara de telefone
    const telefoneInput = document.getElementById('editTelefone');
    if (telefoneInput) {
      telefoneInput.addEventListener('input', (e) => {
        e.target.value = this.formatPhone(e.target.value);
      });
    }
  }

  /**
   * Carrega dados do perfil.
   */
  async loadProfile() {
    try {
      showLoading();
      
      // CRÍTICO: Sempre tenta carregar do servidor primeiro para garantir consistência
      // Não confia apenas no localStorage que pode conter dados de outro usuário
      let userData;
      try {
        userData = await apiGet('/auth/me');
        // CRÍTICO: Atualiza localStorage com dados validados do servidor
        localStorage.setItem('notadez_user', JSON.stringify(userData));
      } catch (e) {
        console.error('Erro ao carregar dados do servidor:', e);
        // Se falhar, tenta do localStorage apenas como fallback
        const userStr = localStorage.getItem('notadez_user');
        if (userStr) {
          userData = JSON.parse(userStr);
          console.warn('Usando dados do localStorage como fallback. Pode não estar sincronizado.');
        } else {
          throw new Error('Não foi possível carregar dados do usuário');
        }
      }

      this.user = userData;
      this.renderProfile(userData);
      
      // Carrega estatísticas
      await this.loadStatistics();
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
    } finally {
      hideLoading();
    }
  }

  /**
   * Carrega estatísticas do professor.
   */
  async loadStatistics() {
    try {
      const metrics = await apiGet('/dashboard/metrics');
      
      // Atualiza estatísticas na tela
      const statDisciplinas = document.getElementById('statDisciplinas');
      const statTurmas = document.getElementById('statTurmas');
      const statAlunos = document.getElementById('statAlunos');
      const statComponentes = document.getElementById('statComponentes');

      if (statDisciplinas) {
        this.animateNumber(statDisciplinas, metrics.disciplinas || 0);
      }
      if (statTurmas) {
        this.animateNumber(statTurmas, metrics.turmas || 0);
      }
      if (statAlunos) {
        this.animateNumber(statAlunos, metrics.alunos || 0);
      }
      if (statComponentes) {
        this.animateNumber(statComponentes, metrics.componentes || 0);
      }

      // Carrega dados reais para gráficos e progresso
      await Promise.all([
        this.loadRealProgress(metrics),
        this.loadRealDistribution(),
        this.loadRealActivities()
      ]);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Não mostra erro pois é informação secundária
    }
  }

  /**
   * Carrega progresso real de notas lançadas.
   */
  async loadRealProgress(metrics) {
    try {
      // Busca todas as turmas
      const turmas = await apiGet('/turmas');
      
      let totalNotas = 0;
      let notasLancadas = 0;

      // Para cada turma, busca componentes e verifica notas
      for (const turma of turmas) {
        try {
          const componentes = await apiGet(`/turmas/${turma.id}/componentes`);
          
          for (const componente of componentes) {
            try {
              const grid = await apiGet(`/lancamentos/${turma.id}/${componente.id}`);
              const totalAlunos = grid.length;
              totalNotas += totalAlunos;
              
              // Conta quantas notas foram lançadas (não são null)
              const lancadas = grid.filter(item => item.nota !== null && item.nota !== undefined).length;
              notasLancadas += lancadas;
            } catch (e) {
              // Ignora erros de componentes sem notas
            }
          }
        } catch (e) {
          // Ignora erros de turmas sem componentes
        }
      }

      const percentualNotas = totalNotas > 0 ? Math.round((notasLancadas / totalNotas) * 100) : 0;

      const progressNotasBar = document.getElementById('progressNotasBar');
      const progressNotasValue = document.getElementById('progressNotasValue');
      const notasLancadasEl = document.getElementById('notasLancadas');
      const notasTotalEl = document.getElementById('notasTotal');

      if (progressNotasBar) {
        setTimeout(() => {
          progressNotasBar.style.width = percentualNotas + '%';
        }, 300);
      }
      if (progressNotasValue) {
        progressNotasValue.textContent = percentualNotas + '%';
      }
      if (notasLancadasEl) {
        notasLancadasEl.textContent = notasLancadas;
      }
      if (notasTotalEl) {
        notasTotalEl.textContent = totalNotas;
      }

      // Atualiza desempenho geral
      this.updatePerformance(percentualNotas);
    } catch (error) {
      console.error('Erro ao carregar progresso real:', error);
      // Define valores padrão em caso de erro
      const progressNotasBar = document.getElementById('progressNotasBar');
      const progressNotasValue = document.getElementById('progressNotasValue');
      const notasLancadasEl = document.getElementById('notasLancadas');
      const notasTotalEl = document.getElementById('notasTotal');
      
      if (progressNotasBar) progressNotasBar.style.width = '0%';
      if (progressNotasValue) progressNotasValue.textContent = '0%';
      if (notasLancadasEl) notasLancadasEl.textContent = '0';
      if (notasTotalEl) notasTotalEl.textContent = '0';
      
      // Atualiza desempenho para 0%
      this.updatePerformance(0);
    }
  }

  /**
   * Carrega distribuição real de notas.
   */
  async loadRealDistribution() {
    try {
      const turmas = await apiGet('/turmas');
      const notas = [];

      // Coleta todas as notas de todas as turmas
      for (const turma of turmas) {
        try {
          const disciplinas = await apiGet(`/disciplinas`);
          
          for (const disciplina of disciplinas) {
            try {
              const notasFinais = await apiGet(`/notas-finais/${disciplina.id}/${turma.id}`);
              
              for (const notaFinal of notasFinais) {
                if (notaFinal.notaFinal !== null && notaFinal.notaFinal !== undefined) {
                  notas.push(parseFloat(notaFinal.notaFinal));
                }
              }
            } catch (e) {
              // Ignora erros
            }
          }
        } catch (e) {
          // Ignora erros
        }
      }

      // Calcula distribuição por faixas
      const distribuicao = {
        '0-4': 0,
        '5-6': 0,
        '7-8': 0,
        '9-10': 0
      };

      notas.forEach(nota => {
        if (nota >= 0 && nota < 5) distribuicao['0-4']++;
        else if (nota >= 5 && nota < 7) distribuicao['5-6']++;
        else if (nota >= 7 && nota < 9) distribuicao['7-8']++;
        else if (nota >= 9 && nota <= 10) distribuicao['9-10']++;
      });

      // Atualiza gráfico
      this.updateDistributionChart(distribuicao, notas.length);
    } catch (error) {
      console.error('Erro ao carregar distribuição:', error);
    }
  }

  /**
   * Atualiza gráfico de distribuição.
   */
  updateDistributionChart(distribuicao, total) {
    const chartSubtitle = document.getElementById('chartSubtitle');
    
    if (total === 0) {
      if (chartSubtitle) {
        chartSubtitle.textContent = 'Nenhuma nota final calculada ainda';
      }
      return;
    }

    const maxValue = Math.max(...Object.values(distribuicao), 1);
    const bars = document.querySelectorAll('.chart-bar-item');
    
    const faixas = ['0-4', '5-6', '7-8', '9-10'];
    
    bars.forEach((bar, index) => {
      const faixa = faixas[index];
      const valor = distribuicao[faixa] || 0;
      const percentual = maxValue > 0 ? (valor / maxValue) * 100 : 0;
      
      const chartBar = bar.querySelector('.chart-bar');
      const chartLabel = bar.querySelector('.chart-bar-label');
      
      if (chartBar) {
        chartBar.style.height = percentual + '%';
        chartBar.setAttribute('data-value', valor);
      }
      if (chartLabel) {
        chartLabel.textContent = valor;
      }
    });

    if (chartSubtitle) {
      chartSubtitle.textContent = `Distribuição de ${total} nota${total !== 1 ? 's' : ''} final${total !== 1 ? 'is' : ''} dos seus alunos`;
    }
  }

  /**
   * Atualiza círculo de desempenho geral.
   */
  updatePerformance(percentual) {
    const performanceValue = document.getElementById('performanceValue');
    const performanceCircle = document.getElementById('performanceCircle');
    const performanceNotas = document.getElementById('performanceNotas');

    if (performanceValue) {
      performanceValue.textContent = percentual + '%';
    }

    if (performanceNotas) {
      performanceNotas.textContent = percentual + '%';
    }

    if (performanceCircle) {
      // Cálculo do stroke-dasharray: (percentual / 100) * 339 (circunferência)
      const dashOffset = (percentual / 100) * 339;
      performanceCircle.style.strokeDasharray = `${dashOffset}, 339`;
    }
  }

  /**
   * Carrega atividades recentes reais.
   */
  async loadRealActivities() {
    try {
      const turmas = await apiGet('/turmas');
      const atividades = [];

      // Busca últimas turmas acessadas (simulado com últimas turmas)
      const turmasRecentes = turmas.slice(0, 4);

      for (const turma of turmasRecentes) {
        try {
          const componentes = await apiGet(`/turmas/${turma.id}/componentes`);
          
          if (componentes.length > 0) {
            const componente = componentes[0];
            const grid = await apiGet(`/lancamentos/${turma.id}/${componente.id}`);
            const temNotas = grid.some(item => item.nota !== null);
            
            if (temNotas) {
              atividades.push({
                tipo: 'notas',
                texto: `Notas lançadas em ${turma.nome}`,
                tempo: 'Recentemente',
                cor: 'blue'
              });
            }
          }
        } catch (e) {
          // Ignora erros
        }
      }

      // Renderiza apenas atividades reais (sem adicionar fictícias)
      this.renderActivities(atividades.slice(0, 4));
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  }

  /**
   * Renderiza atividades na timeline.
   */
  renderActivities(atividades) {
    const timeline = document.getElementById('activityTimeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    if (atividades.length === 0) {
      timeline.innerHTML = `
        <div class="activity-empty" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <p>Nenhuma atividade recente encontrada</p>
        </div>
      `;
      return;
    }

    atividades.forEach((atividade, index) => {
      const icons = {
        'notas': `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>`,
        'presenca': `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`,
        'aluno': `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`,
        'relatorio': `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`
      };

      const colors = {
        'blue': 'activity-icon-blue',
        'green': 'activity-icon-green',
        'purple': 'activity-icon-purple',
        'orange': 'activity-icon-orange'
      };

      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <div class="activity-icon ${colors[atividade.cor] || 'activity-icon-blue'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${icons[atividade.tipo] || icons.notas}
          </svg>
        </div>
        <div class="activity-content">
          <p><strong>${atividade.texto}</strong></p>
          <span class="activity-time">${atividade.tempo}</span>
        </div>
      `;
      
      timeline.appendChild(item);
    });
  }

  /**
   * Anima número ao carregar.
   */
  animateNumber(element, target) {
    if (!element || target === 0) return;
    
    let current = 0;
    const increment = target / 20;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 30);
  }

  /**
   * Renderiza dados do perfil na interface.
   */
  renderProfile(user) {
    // Normaliza dados do usuário (pode vir de diferentes fontes)
    const userData = {
      nome: user.nome || user.name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      telefone: user.telefone || ''
    };

    // Nome
    const profileName = document.getElementById('profileName');
    if (profileName) profileName.textContent = userData.nome;

    // Email
    const profileEmail = document.getElementById('profileEmail');
    const contactEmail = document.getElementById('contactEmail');
    if (profileEmail) profileEmail.textContent = userData.email || 'Sem email';
    if (contactEmail) contactEmail.textContent = userData.email || 'Não informado';

    // Telefone
    const contactPhone = document.getElementById('contactPhone');
    if (contactPhone) {
      contactPhone.textContent = userData.telefone || 'Não informado';
    }

    // Data de cadastro (simulado, já que não temos esse campo)
    const sinceEl = document.getElementById('profileSince');
    if (sinceEl) {
      sinceEl.textContent = '2025';
    }

    // Preenche formulário de edição
    const nomeInput = document.getElementById('editNome');
    const emailInput = document.getElementById('editEmail');
    const telefoneInput = document.getElementById('editTelefone');

    if (nomeInput) nomeInput.value = userData.nome;
    if (emailInput) emailInput.value = userData.email;
    if (telefoneInput) telefoneInput.value = userData.telefone;
  }

  /**
   * Inicia modo de edição.
   */
  startEditing() {
    this.isEditing = true;
    const editCard = document.getElementById('editFormCard');

    if (editCard) editCard.classList.remove('hidden');

    // Scroll suave até o formulário
    editCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Foca no primeiro campo
    const nomeInput = document.getElementById('editNome');
    if (nomeInput) {
      setTimeout(() => nomeInput.focus(), 300);
    }
  }

  /**
   * Cancela edição.
   */
  cancelEditing() {
    this.isEditing = false;
    const editCard = document.getElementById('editFormCard');

    if (editCard) editCard.classList.add('hidden');

    // Limpa campos de senha
    const senhaInput = document.getElementById('editSenha');
    const senhaConfirmInput = document.getElementById('editSenhaConfirm');
    if (senhaInput) senhaInput.value = '';
    if (senhaConfirmInput) senhaConfirmInput.value = '';

    // Scroll de volta ao topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Salva alterações do perfil.
   */
  async saveProfile() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    const formData = new FormData(form);
    const nome = formData.get('nome');
    const email = formData.get('email');
    const telefone = formData.get('telefone');
    const senha = formData.get('senha');
    const senhaConfirm = formData.get('senhaConfirm');

    // Validações
    if (!nome || !email) {
      showToast('Nome e e-mail são obrigatórios', 'error');
      return;
    }

    if (senha && senha.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    if (senha && senha !== senhaConfirm) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    try {
      showLoading();
      const saveBtn = document.getElementById('saveProfileBtn');
      const btnText = saveBtn?.querySelector('.btn-text');
      const btnSpinner = saveBtn?.querySelector('.btn-spinner');

      if (btnText) btnText.textContent = 'Salvando...';
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (saveBtn) saveBtn.disabled = true;

      // Prepara dados para envio
      const updateData = {
        nome,
        email,
        telefone: telefone || null,
      };

      // Adiciona senha apenas se foi informada
      if (senha) {
        updateData.senha = senha;
      }

      // Atualiza perfil
      const updated = await apiPatch('/users/me', updateData);

      // Atualiza localStorage
      if (updated) {
        const userStr = localStorage.getItem('notadez_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          Object.assign(user, updated);
          localStorage.setItem('notadez_user', JSON.stringify(user));
        }
      }

      showToast('Perfil atualizado com sucesso!', 'success');
      
      // Recarrega dados
      await this.loadProfile();
      
      // Volta para visualização
      this.cancelEditing();

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      const errorMsg = error.message || 'Erro ao salvar alterações';
      showToast(errorMsg, 'error');
    } finally {
      hideLoading();
      const saveBtn = document.getElementById('saveProfileBtn');
      const btnText = saveBtn?.querySelector('.btn-text');
      const btnSpinner = saveBtn?.querySelector('.btn-spinner');

      if (btnText) btnText.textContent = 'Salvar Alterações';
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  /**
   * Formata número de telefone.
   */
  formatPhone(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    }
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
   * Configura menu mobile (não necessário para navbar horizontal).
   */
  setupMobileMenu() {
    // Não necessário para navbar horizontal
  }
}

// Inicializa quando DOM estiver pronto
let profileManager = null;

document.addEventListener('DOMContentLoaded', () => {
  profileManager = new ProfileManager();
});

