// LUCAS
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

let instituicoes = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInstituicoes();
});

function setupEventListeners() {
  const addBtn = document.getElementById('addInstitutionBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => showModal());
  }

  const form = document.getElementById('institutionForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterInstituicoes);
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
  }
}

async function loadInstituicoes() {
  try {
    showLoadingState();
    
    const response = await fetch(`${API_BASE_URL}/instituicoes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar instituições');
    }

    instituicoes = await response.json();
    renderInstituicoes();
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    showToast('Erro ao carregar instituições', 'error');
  } finally {
    hideLoadingState();
  }
}

function showLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const content = document.getElementById('institutionsContent');
  
  if (loadingState) loadingState.classList.remove('hidden');
  if (content) content.classList.add('hidden');
}

function hideLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const content = document.getElementById('institutionsContent');
  
  if (loadingState) loadingState.classList.add('hidden');
  if (content) content.classList.remove('hidden');
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
    <div class="institution-card">
      <div class="institution-card-header">
        <h3>${escapeHtml(inst.nome)}</h3>
        <div class="institution-actions">
          <button class="btn-icon" onclick="editInstituicao(${inst.idInstituicao})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteInstituicao(${inst.idInstituicao})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="institution-card-body">
        ${inst.endereco ? `<p><strong>Endereço:</strong> ${escapeHtml(inst.endereco)}</p>` : ''}
        ${inst.descricao ? `<p>${escapeHtml(inst.descricao)}</p>` : ''}
      </div>
      <div class="institution-card-footer">
        <button class="btn-secondary btn-sm" onclick="viewCursos(${inst.idInstituicao})">
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
    (inst.endereco && inst.endereco.toLowerCase().includes(searchTerm))
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
    <div class="institution-card">
      <div class="institution-card-header">
        <h3>${escapeHtml(inst.nome)}</h3>
        <div class="institution-actions">
          <button class="btn-icon" onclick="editInstituicao(${inst.idInstituicao})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteInstituicao(${inst.idInstituicao})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="institution-card-body">
        ${inst.endereco ? `<p><strong>Endereço:</strong> ${escapeHtml(inst.endereco)}</p>` : ''}
        ${inst.descricao ? `<p>${escapeHtml(inst.descricao)}</p>` : ''}
      </div>
      <div class="institution-card-footer">
        <button class="btn-secondary btn-sm" onclick="viewCursos(${inst.idInstituicao})">
          Ver Cursos
        </button>
      </div>
    </div>
  `).join('');
}

function showModal(id = null) {
  const modal = document.getElementById('institutionModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('institutionForm');
  
  if (!modal || !form) return;

  editingId = id;

  if (id) {
    const inst = instituicoes.find(i => i.idInstituicao === id);
    if (!inst) return;

    if (title) title.textContent = 'Editar Instituição';
    document.getElementById('institutionName').value = inst.nome || '';
    document.getElementById('institutionAddress').value = inst.endereco || '';
    document.getElementById('institutionDescription').value = inst.descricao || '';
  } else {
    if (title) title.textContent = 'Adicionar Instituição';
    form.reset();
  }

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('institutionModal');
  if (modal) {
    modal.classList.remove('active');
  }
  editingId = null;
}

async function handleSubmit(e) {
  e.preventDefault();

  const nome = document.getElementById('institutionName').value;
  const endereco = document.getElementById('institutionAddress').value;
  const descricao = document.getElementById('institutionDescription').value;

  const data = { nome, endereco, descricao };

  try {
    const url = editingId 
      ? `${API_BASE_URL}/instituicoes/${editingId}`
      : `${API_BASE_URL}/instituicoes`;
    
    const method = editingId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar instituição');
    }

    showToast(editingId ? 'Instituição atualizada com sucesso' : 'Instituição criada com sucesso', 'success');
    closeModal();
    await loadInstituicoes();
  } catch (error) {
    console.error('Erro ao salvar instituição:', error);
    showToast('Erro ao salvar instituição', 'error');
  }
}

function editInstituicao(id) {
  showModal(id);
}

async function deleteInstituicao(id) {
  if (!confirm('Tem certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/instituicoes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir instituição');
    }

    showToast('Instituição excluída com sucesso', 'success');
    await loadInstituicoes();
  } catch (error) {
    console.error('Erro ao excluir instituição:', error);
    showToast('Erro ao excluir instituição', 'error');
  }
}

function viewCursos(idInstituicao) {
  window.location.href = `/cursos.html?idInstituicao=${idInstituicao}`;
}

function showAddInstitutionDialog() {
  showModal();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 3000;';
  document.body.appendChild(container);
  return container;
}

window.showModal = showModal;
window.closeModal = closeModal;
window.showAddInstitutionDialog = showAddInstitutionDialog;
window.editInstituicao = editInstituicao;
window.deleteInstituicao = deleteInstituicao;
window.viewCursos = viewCursos;