// RAFAEL
class TurmasManager {
  constructor() {
    this.modal = createModal('turmaModal');
    this.editingId = null;
    this.disciplinas = [];
    this.init();
  }

  async init() {
    await this.loadDisciplinas();
    await this.loadTurmas();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Filtro por disciplina
    document.getElementById('disciplinaFilter').addEventListener('change', async (e) => {
      await this.loadTurmas(e.target.value);
    });

    // Validação em tempo real
    const inputs = document.querySelectorAll('#turmaForm input, #turmaForm select');
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
    
    field.classList.remove('error');
    
    if (field.hasAttribute('required') && !value) {
      field.classList.add('error');
      return false;
    }
    
    if (field.type === 'number' && value && parseInt(value) < 1) {
      field.classList.add('error');
      return false;
    }
    
    return true;
  }

  async loadDisciplinas() {
    try {
      this.disciplinas = await apiGet('/disciplinas');
      
      // Preenche filtro
      const filterSelect = document.getElementById('disciplinaFilter');
      filterSelect.innerHTML = '<option value="">Todas</option>' +
        this.disciplinas.map(d => `<option value="${d.idDisciplina}">${d.nome}</option>`).join('');
      
      // Preenche select do modal
      this.updateDisciplinasSelect();
    } catch (error) {
      showToast('Erro ao carregar disciplinas', 'error');
      console.error(error);
    }
  }

  updateDisciplinasSelect() {
    const modalSelect = document.getElementById('idDisciplina');
    modalSelect.innerHTML = '<option value="">Selecione uma disciplina</option>' +
      this.disciplinas.map(d => `<option value="${d.idDisciplina}">${d.nome}</option>`).join('');
  }

  async loadTurmas(disciplinaId = '') {
    try {
      showLoading();
      const url = disciplinaId ? `/turmas?disciplinaId=${disciplinaId}` : '/turmas';
      const turmas = await apiGet(url);
      this.renderTurmas(turmas);
    } catch (error) {
      showToast('Erro ao carregar turmas', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }

  renderTurmas(turmas) {
    const tbody = document.getElementById('turmasTable');
    
    if (turmas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; padding: var(--space-12); color: var(--gray-500);">
            <svg style="width: 3rem; height: 3rem; margin: 0 auto var(--space-4); opacity: 0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style="margin: 0; font-size: var(--text-base);">Nenhuma turma cadastrada</p>
            <p style="margin: var(--space-2) 0 0; font-size: var(--text-sm); color: var(--gray-400);">Clique em "Nova Turma" para começar</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = turmas.map(t => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.5rem; height: 2.5rem; background: var(--bg-gradient-blue-2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); font-size: var(--text-sm);">
              ${t.nomeTurma.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: var(--font-semibold); color: var(--gray-900);">${t.nomeTurma}</div>
              ${t.horario ? `<div style="font-size: var(--text-sm); color: var(--gray-600);">${t.horario}</div>` : ''}
              ${t.sala ? `<div style="font-size: var(--text-xs); color: var(--gray-500);">Sala: ${t.sala}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 2rem; height: 2rem; background: var(--bg-gradient-blue-1); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); font-size: var(--text-xs);">
              ${t.disciplina?.sigla ? t.disciplina.sigla.substring(0, 3).toUpperCase() : t.disciplina?.nome.substring(0, 2).toUpperCase() || '?'}
            </div>
            <div>
              <div style="font-weight: var(--font-medium); color: var(--gray-800); font-size: var(--text-sm);">${t.disciplina?.nome || '—'}</div>
              ${t.capacidade ? `<div style="font-size: var(--text-xs); color: var(--gray-600);">Capacidade: ${t.capacidade} alunos</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="turmasManager.openEditModal(${t.idTurma})" class="btn-icon" title="Editar">
              <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onclick="turmasManager.verDetalhes(${t.idTurma})" class="btn-icon" style="background: var(--info); color: white;" title="Ver Detalhes">
              <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            <button onclick="turmasManager.deleteTurma(${t.idTurma})" class="btn-icon" style="background: var(--error); color: white;" title="Excluir">
              <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  openCreateModal() {
    this.editingId = null;
    this.modal.clearErrors();
    this.modal.setTitle('Nova Turma');
    
    document.getElementById('turmaForm').reset();
    document.getElementById('idTurma').value = '';
    this.updateDisciplinasSelect();
    
    this.modal.open();
  }

  async openEditModal(id) {
    try {
      showLoading();
      const turma = await apiGet(`/turmas/${id}`);
      
      this.editingId = id;
      this.modal.clearErrors();
      this.modal.setTitle('Editar Turma');
      
      this.updateDisciplinasSelect();
      
      document.getElementById('idDisciplina').value = turma.idDisciplina || '';
      document.getElementById('nomeTurma').value = turma.nomeTurma || '';
      document.getElementById('horario').value = turma.horario || '';
      document.getElementById('sala').value = turma.sala || '';
      document.getElementById('capacidade').value = turma.capacidade || '';
      document.getElementById('idTurma').value = id;
      
      this.modal.open();
    } catch (error) {
      showToast('Erro ao carregar turma', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }

  async submitForm() {
    if (!this.modal.validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    const formData = this.modal.getFormData();
    
    // Remove idTurma sempre (não deve ser enviado na criação/edição via DTO)
    if (formData.idTurma !== undefined) {
      delete formData.idTurma;
    }
    
    // Converte idDisciplina para número (obrigatório)
    if (formData.idDisciplina) {
      const parsed = parseInt(formData.idDisciplina, 10);
      if (!isNaN(parsed)) {
        formData.idDisciplina = parsed;
      }
    }
    
    // Converte capacidade para número se presente e não vazio
    if (formData.capacidade && formData.capacidade.toString().trim() !== '') {
      const parsed = parseInt(formData.capacidade, 10);
      if (!isNaN(parsed)) {
        formData.capacidade = parsed;
      } else {
        delete formData.capacidade;
      }
    } else {
      delete formData.capacidade;
    }
    
    // Remove campos opcionais vazios
    if (!formData.horario || formData.horario.toString().trim() === '') {
      delete formData.horario;
    }
    if (!formData.sala || formData.sala.toString().trim() === '') {
      delete formData.sala;
    }
    
    // Log para debug (remover em produção)
    console.log('Payload enviado:', formData);

    try {
      this.modal.showButtonLoading(true);
      
      if (this.editingId) {
        await apiPatch(`/turmas/${this.editingId}`, formData);
        showToast('Turma atualizada com sucesso!', 'success');
      } else {
        await apiPost('/turmas', formData);
        showToast('Turma criada com sucesso!', 'success');
      }
      
      this.modal.close();
      await this.loadTurmas(document.getElementById('disciplinaFilter').value);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Erro ao salvar turma', 'error');
    } finally {
      this.modal.showButtonLoading(false);
    }
  }

  async deleteTurma(id) {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      showLoading();
      await apiDelete(`/turmas/${id}`);
      showToast('Turma excluída com sucesso!', 'success');
      await this.loadTurmas(document.getElementById('disciplinaFilter').value);
    } catch (error) {
      showToast('Erro ao excluir turma', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }



  verDetalhes(id) {
    window.location.href = `/turma_hub.html?id=${id}`;
  }
}



let turmasManager;

document.addEventListener('DOMContentLoaded', () => {
  turmasManager = new TurmasManager();
});
