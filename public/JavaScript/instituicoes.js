// LUCAS
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

let instituicoes = [];
let editingId = null;
let modal = null;
let deleteModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInstituicoes();
});

function setupEventListeners() {
  // Modal principal
  modal = createModal('institutionModal');
  
  // Modal de exclusão
  deleteModal = createModal('deleteModal');
  
  // Botões de adicionar
  const addBtn = document.getElementById('addInstitutionBtn');
  const addBtnEmpty = document.getElementById('addInstitutionBtnEmpty');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => showModal());
  }
  
  if (addBtnEmpty) {
    addBtnEmpty.addEventListener('click', () => showModal());
  }

  // Formulário
  const form = document.getElementById('institutionForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Busca
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterInstituicoes);
  }
}

async function loadInstituicoes() {
  try {
    showLoading();
    
    instituicoes = await apiGet('/instituicoes');
    renderInstituicoes();
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao carregar instituições';
    showToast('Erro: ' + errorMessage, 'error');
    
    const loadingState = document.getElementById('loadingState');
    const content = document.getElementById('institutionsContent');
    if (loadingState) loadingState.classList.add('hidden');
    if (content) content.classList.remove('hidden');
  } finally {
    hideLoading();
    
    const loadingState = document.getElementById('loadingState');
    const content = document.getElementById('institutionsContent');
    if (loadingState) loadingState.classList.add('hidden');
    if (content) content.classList.remove('hidden');
  }
}

function renderInstituicoes() {
  const grid = document.getElementById('institutionsGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!grid) return;

  if (instituicoes.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = instituicoes.map(inst => `
    <div class="card-modern" style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h3 style="font-size: var(--text-xl); font-weight: var(--font-semibold); color: var(--gray-900); margin: 0 0 var(--space-2);">
            ${escapeHtml(inst.nome)}
          </h3>
          ${inst.endereco ? `<p style="color: var(--gray-600); font-size: var(--text-sm); margin: 0 0 var(--space-3);">
            <svg style="width: 1rem; height: 1rem; vertical-align: middle; margin-right: var(--space-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${escapeHtml(inst.endereco)}
          </p>` : ''}
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button class="action-btn-table action-btn-edit-table" onclick="editInstituicao(${inst.idInstituicao})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn-table action-btn-delete-table" onclick="deleteInstituicao(${inst.idInstituicao})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      ${inst.descricao ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0; line-height: 1.6;">${escapeHtml(inst.descricao)}</p>` : ''}
      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-2);">
        <button class="btn-secondary" onclick="viewCursos(${inst.idInstituicao})" style="flex: 1;">
          Ver Cursos
        </button>
      </div>
    </div>
  `).join('');
}

function filterInstituicoes() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  const searchTerm = searchInput.value.toLowerCase();
  const filtered = instituicoes.filter(inst => 
    inst.nome.toLowerCase().includes(searchTerm) ||
    (inst.endereco && inst.endereco.toLowerCase().includes(searchTerm)) ||
    (inst.descricao && inst.descricao.toLowerCase().includes(searchTerm))
  );

  const grid = document.getElementById('institutionsGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = filtered.map(inst => `
    <div class="card-modern" style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h3 style="font-size: var(--text-xl); font-weight: var(--font-semibold); color: var(--gray-900); margin: 0 0 var(--space-2);">
            ${escapeHtml(inst.nome)}
          </h3>
          ${inst.endereco ? `<p style="color: var(--gray-600); font-size: var(--text-sm); margin: 0 0 var(--space-3);">
            <svg style="width: 1rem; height: 1rem; vertical-align: middle; margin-right: var(--space-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${escapeHtml(inst.endereco)}
          </p>` : ''}
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button class="action-btn-table action-btn-edit-table" onclick="editInstituicao(${inst.idInstituicao})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn-table action-btn-delete-table" onclick="deleteInstituicao(${inst.idInstituicao})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      ${inst.descricao ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0; line-height: 1.6;">${escapeHtml(inst.descricao)}</p>` : ''}
      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-2);">
        <button class="btn-secondary" onclick="viewCursos(${inst.idInstituicao})" style="flex: 1;">
          Ver Cursos
        </button>
      </div>
    </div>
  `).join('');
}

function showModal(id = null) {
  if (!modal) return;
  
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('institutionForm');
  
  if (!form) return;

  editingId = id;

  if (id) {
    const inst = instituicoes.find(i => i.idInstituicao === id);
    if (!inst) return;

    if (title) title.textContent = 'Editar Instituição';
    document.getElementById('institutionName').value = inst.nome || '';
    document.getElementById('institutionAddress').value = inst.endereco || '';
    document.getElementById('institutionDescription').value = inst.descricao || '';
  } else {
    if (title) title.textContent = 'Nova Instituição';
    form.reset();
  }

  modal.open();
}

function closeModal() {
  if (modal) {
    modal.close();
  }
  editingId = null;
}

function closeDeleteModal() {
  if (deleteModal) {
    deleteModal.close();
  }
  editingId = null;
}

async function handleSubmit(e) {
  e.preventDefault();

  const nome = document.getElementById('institutionName').value.trim();
  const endereco = document.getElementById('institutionAddress').value.trim();
  const descricao = document.getElementById('institutionDescription').value.trim();

  if (!nome) {
    showToast('O nome da instituição é obrigatório', 'error');
    return;
  }

  const data = { nome, endereco: endereco || undefined, descricao: descricao || undefined };

  try {
    showLoading();
    
    if (editingId) {
      await apiPatch(`/instituicoes/${editingId}`, data);
      showToast('Instituição atualizada com sucesso', 'success');
    } else {
      await apiPost('/instituicoes', data);
      showToast('Instituição criada com sucesso', 'success');
    }
    
    closeModal();
    await loadInstituicoes();
    
    // Se criou uma nova instituição, verifica se ainda precisa de primeiro acesso
    if (!editingId) {
      setTimeout(async () => {
        try {
          const firstAccess = await apiGet('/dashboard/first-access');
          if (!firstAccess.isFirstAccess) {
            // Já tem instituição e curso, pode ir para o dashboard
            showToast('Configuração inicial concluída! Redirecionando...', 'success');
            setTimeout(() => {
              window.location.href = '/index.html';
            }, 1500);
          }
        } catch (error) {
          console.warn('Erro ao verificar primeiro acesso:', error);
        }
      }, 500);
    }
  } catch (error) {
    console.error('Erro ao salvar instituição:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao salvar instituição';
    showToast('Erro: ' + errorMessage, 'error');
  } finally {
    hideLoading();
  }
}

function editInstituicao(id) {
  showModal(id);
}

async function deleteInstituicao(id) {
  const inst = instituicoes.find(i => i.idInstituicao === id);
  if (!inst) return;
  
  editingId = id;
  if (deleteModal) {
    deleteModal.open();
  } else {
    // Fallback para confirm se modal não estiver disponível
    if (confirm(`Tem certeza que deseja excluir a instituição "${inst.nome}"? Esta ação não pode ser desfeita.`)) {
      await confirmDelete();
    }
  }
}

async function confirmDelete() {
  if (!editingId) return;
  
  try {
    showLoading();
    await apiDelete(`/instituicoes/${editingId}`);
    showToast('Instituição excluída com sucesso', 'success');
    closeDeleteModal();
    await loadInstituicoes();
  } catch (error) {
    console.error('Erro ao excluir instituição:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao excluir instituição';
    showToast('Erro: ' + errorMessage, 'error');
  } finally {
    hideLoading();
  }
}

function viewCursos(idInstituicao) {
  window.location.href = `/cursos.html?idInstituicao=${idInstituicao}`;
}

function showAddInstitutionDialog() {
  showModal();
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Torna funções globais para uso em onclick
window.showModal = showModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.showAddInstitutionDialog = showAddInstitutionDialog;
window.editInstituicao = editInstituicao;
window.deleteInstituicao = deleteInstituicao;
window.viewCursos = viewCursos;
window.confirmDelete = confirmDelete;

