// LUCAS
class DisciplinasManager {
  constructor() {
    this.modal = createModal('disciplinaModal');
    this.deleteModal = createModal('deleteConfirmModal');
    this.editingId = null;
    this.deleteId = null;
    this.deleteNome = null;
    this.init();
  }

  init() {
    this.loadDisciplinas();
    this.setupFormListeners();
  }

  setupFormListeners() {
    // Toggle campo de pesos baseado na regra selecionada
    const regraSelect = document.getElementById('regra');
    const pesosContainer = document.getElementById('pesosContainer');
    
    if (regraSelect) {
      regraSelect.addEventListener('change', () => {
        if (regraSelect.value === 'PONDERADA') {
          pesosContainer.style.display = 'block';
        } else {
          pesosContainer.style.display = 'none';
          document.getElementById('pesosJson').value = '';
        }
      });
    }

    // Validação em tempo real
    const inputs = document.querySelectorAll('#disciplinaForm input, #disciplinaForm select, #disciplinaForm textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    
    // Limpa erros anteriores
    field.classList.remove('error');
    
    // Campo obrigatório
    if (field.hasAttribute('required') && !value) {
      field.classList.add('error');
      return false;
    }
    
    // Validação específica para JSON de pesos
    if (field.id === 'pesosJson' && value) {
      try {
        const pesos = JSON.parse(value);
        const soma = Object.values(pesos).reduce((a, b) => a + b, 0);
        
        if (Math.abs(soma - 1.0) > 0.01) {
          field.classList.add('error');
          this.modal.showFieldError('pesosJson', 'A soma dos pesos deve ser 1.0');
          return false;
        }
      } catch (e) {
        field.classList.add('error');
        this.modal.showFieldError('pesosJson', 'JSON inválido');
        return false;
      }
    }
    
    return true;
  }

  async loadDisciplinas() {
    try {
      showLoading();
      const disciplinas = await apiGet('/disciplinas');
      this.renderDisciplinas(disciplinas);
    } catch (error) {
      showToast('Erro ao carregar disciplinas', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }

  renderDisciplinas(disciplinas) {
    const tbody = document.getElementById('disciplinasTable');
    
    if (disciplinas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="table-empty">
            <svg class="table-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <h3 class="table-empty-title">Nenhuma disciplina cadastrada</h3>
            <p class="table-empty-text">Comece adicionando sua primeira disciplina ao sistema</p>
            <button class="btn-primary" onclick="disciplinasManager.openCreateModal()">
              <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Criar Primeira Disciplina
            </button>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = disciplinas.map(d => {
      const iniciais = d.sigla ? d.sigla.substring(0, 3).toUpperCase() : d.nome.substring(0, 2).toUpperCase();
      
      // Tag de Sigla
      const siglaTag = d.sigla 
        ? `<span class="tag-rounded tag-sigla">${this.escapeHtml(d.sigla)}</span>`
        : '<span class="tag-rounded tag-sigla-empty">—</span>';
      
      // Tag de Regra
      const regraClass = d.regra === 'PONDERADA' ? 'tag-regra-ponderada' : 'tag-regra-simples';
      const regraIcon = d.regra === 'PONDERADA' 
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      const regraText = d.regra === 'PONDERADA' ? 'Média Ponderada' : 'Média Simples';
      const regraTag = `<span class="tag-rounded ${regraClass}">${regraIcon}<span>${regraText}</span></span>`;
      
      return `
        <tr>
          <td>
            <div class="disciplina-cell">
              <div class="disciplina-avatar-table">
                ${iniciais}
              </div>
              <div class="disciplina-info-table">
                <div class="disciplina-nome-table">${this.escapeHtml(d.nome)}</div>
              </div>
            </div>
          </td>
          <td>
            ${siglaTag}
          </td>
          <td>
            ${regraTag}
          </td>
          <td>
            <div class="actions-cell">
              <button onclick="disciplinasManager.openEditModal(${d.idDisciplina})" class="action-btn-table action-btn-edit-table" title="Editar disciplina">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button onclick="disciplinasManager.verDetalhes(${d.idDisciplina})" class="action-btn-table action-btn-view-table" title="Ver Componentes de Nota">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button onclick="disciplinasManager.confirmDelete(${d.idDisciplina}, '${this.escapeHtml(d.nome)}')" class="action-btn-table action-btn-delete-table" title="Excluir disciplina">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  openCreateModal() {
    this.editingId = null;
    this.modal.clearErrors();
    this.modal.setTitle('Nova Disciplina');
    
    // Reseta formulário
    document.getElementById('disciplinaForm').reset();
    document.getElementById('idDisciplina').value = '';
    document.getElementById('pesosContainer').style.display = 'none';
    
    this.modal.open();
  }

  async openEditModal(id) {
    try {
      showLoading();
      const disciplina = await apiGet(`/disciplinas/${id}`);
      
      this.editingId = id;
      this.modal.clearErrors();
      this.modal.setTitle('Editar Disciplina');
      
      // Preenche formulário
      document.getElementById('nome').value = disciplina.nome || '';
      document.getElementById('sigla').value = disciplina.sigla || '';
      document.getElementById('regra').value = disciplina.regra || 'SIMPLES';
      document.getElementById('idDisciplina').value = id;
      
      // Mostra/preenche campo de pesos se necessário
      if (disciplina.regra === 'PONDERADA' && disciplina.pesosJson) {
        document.getElementById('pesosContainer').style.display = 'block';
        document.getElementById('pesosJson').value = JSON.stringify(disciplina.pesosJson, null, 2);
      } else {
        document.getElementById('pesosContainer').style.display = 'none';
      }
      
      this.modal.open();
    } catch (error) {
      showToast('Erro ao carregar disciplina', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }

  async submitForm() {
    // Valida formulário
    if (!this.modal.validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    // Coleta dados
    const formData = this.modal.getFormData();
    
    // Remove campos que não devem ser enviados em POST
    if (!this.editingId) {
      delete formData.idDisciplina;
    }
    
    // Remove campos vazios
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
        delete formData[key];
      }
    });
    
    // Valida JSON de pesos se regra for PONDERADA
    if (formData.regra === 'PONDERADA') {
      if (!formData.pesosJson || formData.pesosJson.trim() === '') {
        this.modal.showFieldError('pesosJson', 'Pesos são obrigatórios para regra PONDERADA');
        return;
      }
      
      try {
        const pesos = JSON.parse(formData.pesosJson);
        // Valida se é um objeto válido
        if (typeof pesos !== 'object' || Array.isArray(pesos)) {
          throw new Error('Pesos devem ser um objeto JSON válido');
        }
        // Converte para string novamente para enviar ao backend
        formData.pesosJson = JSON.stringify(pesos);
      } catch (e) {
        this.modal.showFieldError('pesosJson', e.message || 'JSON inválido');
        return;
      }
    } else {
      delete formData.pesosJson;
    }

    try {
      this.modal.showButtonLoading(true);
      
      if (this.editingId) {
        // Edição - remove idDisciplina do payload
        delete formData.idDisciplina;
        await apiPatch(`/disciplinas/${this.editingId}`, formData);
        showToast('Disciplina atualizada com sucesso!', 'success');
      } else {
        // Criação - garante que não há idDisciplina
        delete formData.idDisciplina;
        await apiPost('/disciplinas', formData);
        showToast('Disciplina criada com sucesso!', 'success');
      }
      
      this.modal.close();
      await this.loadDisciplinas();
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao salvar disciplina';
      showToast(errorMessage, 'error');
    } finally {
      this.modal.showButtonLoading(false);
    }
  }

  confirmDelete(id, nome) {
    this.deleteId = id;
    this.deleteNome = nome;
    document.getElementById('deleteNomeText').textContent = nome;
    this.deleteModal.open();
  }

  async deleteDisciplina() {
    if (!this.deleteId) return;

    try {
      this.deleteModal.showButtonLoading(true);
      await apiDelete(`/disciplinas/${this.deleteId}`);
      showToast(`Disciplina "${this.deleteNome}" excluída com sucesso!`, 'success');
      this.deleteModal.close();
      await this.loadDisciplinas();
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir disciplina';
      showToast(errorMessage, 'error');
    } finally {
      this.deleteModal.showButtonLoading(false);
      this.deleteId = null;
      this.deleteNome = null;
    }
  }

  verDetalhes(id) {
    window.location.href = `/componentes.html?disciplinaId=${id}`;
  }
}

// Inicializa quando o DOM estiver pronto
let disciplinasManager;

document.addEventListener('DOMContentLoaded', () => {
  disciplinasManager = new DisciplinasManager();
});