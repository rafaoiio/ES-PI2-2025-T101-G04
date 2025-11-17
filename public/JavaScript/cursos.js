// LUCAS
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

let cursos = [];
let instituicoes = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInstituicoes();
  await loadCursos();
});

function setupEventListeners() {
  const addBtn = document.getElementById('addCursoBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => showModal());
  }

  const form = document.getElementById('cursoForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterCursos);
  }

  const instituicaoFilter = document.getElementById('instituicaoFilter');
  if (instituicaoFilter) {
    instituicaoFilter.addEventListener('change', filterCursos);
  }
}

async function loadInstituicoes() {
  try {
    const response = await fetch(`${API_BASE_URL}/instituicoes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar instituições');
    }

    instituicoes = await response.json();
    populateInstituicaoSelects();
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    showToast('Erro ao carregar instituições', 'error');
  }
}

function populateInstituicaoSelects() {
  const selects = [
    document.getElementById('cursoInstituicao'),
    document.getElementById('instituicaoFilter')
  ];

  selects.forEach(select => {
    if (!select) return;
    
    if (select.id === 'cursoInstituicao') {
      select.innerHTML = '<option value="">Selecione uma instituição</option>';
    } else {
      select.innerHTML = '<option value="">Todas as instituições</option>';
    }

    instituicoes.forEach(inst => {
      const option = document.createElement('option');
      option.value = inst.idInstituicao;
      option.textContent = inst.nome;
      select.appendChild(option);
    });
  });
}

async function loadCursos() {
  try {
    showLoadingState();
    
    const response = await fetch(`${API_BASE_URL}/cursos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao carregar cursos');
    }

    cursos = await response.json();
    renderCursos();
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    showToast('Erro ao carregar cursos', 'error');
  } finally {
    hideLoadingState();
  }
}

function showLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const content = document.getElementById('cursosContent');
  
  if (loadingState) loadingState.classList.remove('hidden');
  if (content) content.classList.add('hidden');
}

function hideLoadingState() {
  const loadingState = document.getElementById('loadingState');
  const content = document.getElementById('cursosContent');
  
  if (loadingState) loadingState.classList.add('hidden');
  if (content) content.classList.remove('hidden');
}

function renderCursos(cursosToRender = cursos) {
  const grid = document.getElementById('cursosGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!grid) return;

  if (cursosToRender.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  grid.innerHTML = cursosToRender.map(curso => {
    const instituicao = instituicoes.find(i => i.idInstituicao === curso.idInstituicao);
    return `
    <div class="institution-card">
      <div class="institution-card-header">
        <h3>${escapeHtml(curso.nome)}</h3>
        <div class="institution-actions">
          <button class="btn-icon" onclick="editCurso(${curso.idCurso})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" onclick="deleteCurso(${curso.idCurso})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="institution-card-body">
        <p><strong>Instituição:</strong> ${instituicao ? escapeHtml(instituicao.nome) : 'N/A'}</p>
        ${curso.sigla ? `<p><strong>Sigla:</strong> ${escapeHtml(curso.sigla)}</p>` : ''}
        ${curso.creditos ? `<p><strong>Créditos:</strong> ${curso.creditos}</p>` : ''}
        ${curso.semestre ? `<p><strong>Semestres:</strong> ${curso.semestre}</p>` : ''}
        ${curso.ano ? `<p><strong>Ano:</strong> ${curso.ano}</p>` : ''}
        ${curso.descricao ? `<p>${escapeHtml(curso.descricao)}</p>` : ''}
      </div>
      <div class="institution-card-footer">
        <button class="btn-secondary btn-sm" onclick="viewDisciplinas(${curso.idCurso})">
          Ver Disciplinas
        </button>
      </div>
    </div>
  `;
  }).join('');
}

function filterCursos() {
  const searchInput = document.getElementById('searchInput');
  const instituicaoFilter = document.getElementById('instituicaoFilter');
  
  if (!searchInput || !instituicaoFilter) return;

  const searchTerm = searchInput.value.toLowerCase();
  const instituicaoId = instituicaoFilter.value ? parseInt(instituicaoFilter.value) : null;

  let filtered = cursos;

  if (searchTerm) {
    filtered = filtered.filter(curso => 
      curso.nome.toLowerCase().includes(searchTerm) ||
      (curso.sigla && curso.sigla.toLowerCase().includes(searchTerm)) ||
      (curso.descricao && curso.descricao.toLowerCase().includes(searchTerm))
    );
  }

  if (instituicaoId) {
    filtered = filtered.filter(curso => curso.idInstituicao === instituicaoId);
  }

  renderCursos(filtered);
}

function showModal(id = null) {
  const modal = document.getElementById('cursoModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('cursoForm');
  
  if (!modal || !form) return;

  editingId = id;

  if (id) {
    const curso = cursos.find(c => c.idCurso === id);
    if (!curso) return;

    if (title) title.textContent = 'Editar Curso';
    document.getElementById('cursoInstituicao').value = curso.idInstituicao || '';
    document.getElementById('cursoNome').value = curso.nome || '';
    document.getElementById('cursoSigla').value = curso.sigla || '';
    document.getElementById('cursoCreditos').value = curso.creditos || '';
    document.getElementById('cursoSemestre').value = curso.semestre || '';
    document.getElementById('cursoAno').value = curso.ano || '';
    document.getElementById('cursoDescricao').value = curso.descricao || '';
  } else {
    if (title) title.textContent = 'Adicionar Curso';
    form.reset();
  }

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('cursoModal');
  if (modal) {
    modal.classList.remove('active');
  }
  editingId = null;
}

async function handleSubmit(e) {
  e.preventDefault();

  const idInstituicao = parseInt(document.getElementById('cursoInstituicao').value);
  const nome = document.getElementById('cursoNome').value;
  const sigla = document.getElementById('cursoSigla').value;
  const creditos = document.getElementById('cursoCreditos').value ? parseInt(document.getElementById('cursoCreditos').value) : undefined;
  const semestre = document.getElementById('cursoSemestre').value ? parseInt(document.getElementById('cursoSemestre').value) : undefined;
  const ano = document.getElementById('cursoAno').value ? parseInt(document.getElementById('cursoAno').value) : undefined;
  const descricao = document.getElementById('cursoDescricao').value;

  const data = {
    idInstituicao,
    nome,
    sigla: sigla || undefined,
    creditos,
    semestre,
    ano,
    descricao: descricao || undefined
  };

  try {
    const url = editingId 
      ? `${API_BASE_URL}/cursos/${editingId}`
      : `${API_BASE_URL}/cursos`;
    
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
      throw new Error('Erro ao salvar curso');
    }

    showToast(editingId ? 'Curso atualizado com sucesso' : 'Curso criado com sucesso', 'success');
    closeModal();
    await loadCursos();
  } catch (error) {
    console.error('Erro ao salvar curso:', error);
    showToast('Erro ao salvar curso', 'error');
  }
}

function editCurso(id) {
  showModal(id);
}

async function deleteCurso(id) {
  if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cursos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('notadez_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir curso');
    }

    showToast('Curso excluído com sucesso', 'success');
    await loadCursos();
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    showToast('Erro ao excluir curso', 'error');
  }
}

function viewDisciplinas(idCurso) {
  window.location.href = `/disciplinas.html?idCurso=${idCurso}`;
}

function showAddCursoDialog() {
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
window.showAddCursoDialog = showAddCursoDialog;
window.editCurso = editCurso;
window.deleteCurso = deleteCurso;
window.viewDisciplinas = viewDisciplinas;