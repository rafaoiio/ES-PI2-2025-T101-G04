// LUCAS
// API_BASE_URL é definido em /js/env.js que deve ser carregado antes deste script

let cursos = [];
let instituicoes = [];
let editingId = null;
let modal = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInstituicoes();
  await loadCursos();
});

function setupEventListeners() {
  // Modal principal
  modal = createModal('cursoModal');
  
  // Botões de adicionar
  const addBtn = document.getElementById('addCursoBtn');
  const addBtnEmpty = document.getElementById('addCursoBtnEmpty');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => showModal());
  }
  
  if (addBtnEmpty) {
    addBtnEmpty.addEventListener('click', () => showModal());
  }

  // Formulário
  const form = document.getElementById('cursoForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Busca
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterCursos);
  }

  // Filtro de instituição
  const instituicaoFilter = document.getElementById('instituicaoFilter');
  if (instituicaoFilter) {
    instituicaoFilter.addEventListener('change', filterCursos);
  }
}

async function loadInstituicoes() {
  try {
    instituicoes = await apiGet('/instituicoes');
    populateInstituicaoSelects();
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao carregar instituições';
    showToast('Erro: ' + errorMessage, 'error');
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
  
  // Se veio de uma instituição específica, seleciona ela
  const urlParams = new URLSearchParams(window.location.search);
  const idInstituicao = urlParams.get('idInstituicao');
  if (idInstituicao) {
    const cursoInstituicaoSelect = document.getElementById('cursoInstituicao');
    const instituicaoFilterSelect = document.getElementById('instituicaoFilter');
    if (cursoInstituicaoSelect) cursoInstituicaoSelect.value = idInstituicao;
    if (instituicaoFilterSelect) {
      instituicaoFilterSelect.value = idInstituicao;
      filterCursos();
    }
  }
}

async function loadCursos() {
  try {
    showLoading();
    
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('idInstituicao');
    
    if (idInstituicao) {
      cursos = await apiGet(`/cursos?idInstituicao=${idInstituicao}`);
    } else {
      cursos = await apiGet('/cursos');
    }
    
    renderCursos();
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao carregar cursos';
    showToast('Erro: ' + errorMessage, 'error');
    
    const loadingState = document.getElementById('loadingState');
    const content = document.getElementById('cursosContent');
    if (loadingState) loadingState.classList.add('hidden');
    if (content) content.classList.remove('hidden');
  } finally {
    hideLoading();
    
    const loadingState = document.getElementById('loadingState');
    const content = document.getElementById('cursosContent');
    if (loadingState) loadingState.classList.add('hidden');
    if (content) content.classList.remove('hidden');
  }
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
    <div class="card-modern" style="padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h3 style="font-size: var(--text-xl); font-weight: var(--font-semibold); color: var(--gray-900); margin: 0 0 var(--space-2);">
            ${escapeHtml(curso.nome)}
          </h3>
          <p style="color: var(--gray-600); font-size: var(--text-sm); margin: 0 0 var(--space-3);">
            <svg style="width: 1rem; height: 1rem; vertical-align: middle; margin-right: var(--space-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            ${instituicao ? escapeHtml(instituicao.nome) : 'N/A'}
          </p>
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <button class="action-btn-table action-btn-edit-table" onclick="editCurso(${curso.idCurso})" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn-table action-btn-delete-table" onclick="deleteCurso(${curso.idCurso})" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        ${curso.sigla ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0;"><strong>Sigla:</strong> ${escapeHtml(curso.sigla)}</p>` : ''}
        ${curso.creditos ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0;"><strong>Créditos:</strong> ${curso.creditos}</p>` : ''}
        ${curso.semestre ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0;"><strong>Semestres:</strong> ${curso.semestre}</p>` : ''}
        ${curso.ano ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0;"><strong>Ano:</strong> ${curso.ano}</p>` : ''}
        ${curso.descricao ? `<p style="color: var(--gray-700); font-size: var(--text-sm); margin: 0; line-height: 1.6; margin-top: var(--space-2);">${escapeHtml(curso.descricao)}</p>` : ''}
      </div>
      <div style="display: flex; gap: var(--space-3); margin-top: var(--space-2);">
        <button class="btn-secondary" onclick="viewDisciplinas(${curso.idCurso})" style="flex: 1;">
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
  if (!modal) return;
  
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('cursoForm');
  
  if (!form) return;

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
    if (title) title.textContent = 'Novo Curso';
    form.reset();
    
    // Se veio de uma instituição específica, pré-seleciona ela
    const urlParams = new URLSearchParams(window.location.search);
    const idInstituicao = urlParams.get('idInstituicao');
    if (idInstituicao) {
      document.getElementById('cursoInstituicao').value = idInstituicao;
    }
  }

  modal.open();
}

function closeModal() {
  if (modal) {
    modal.close();
  }
  editingId = null;
}

async function handleSubmit(e) {
  e.preventDefault();

  const idInstituicao = parseInt(document.getElementById('cursoInstituicao').value);
  const nome = document.getElementById('cursoNome').value.trim();
  const sigla = document.getElementById('cursoSigla').value.trim();
  const creditos = document.getElementById('cursoCreditos').value ? parseInt(document.getElementById('cursoCreditos').value) : undefined;
  const semestre = document.getElementById('cursoSemestre').value ? parseInt(document.getElementById('cursoSemestre').value) : undefined;
  const ano = document.getElementById('cursoAno').value ? parseInt(document.getElementById('cursoAno').value) : undefined;
  const descricao = document.getElementById('cursoDescricao').value.trim();

  if (!idInstituicao || isNaN(idInstituicao)) {
    showToast('Selecione uma instituição', 'error');
    return;
  }

  if (!nome) {
    showToast('O nome do curso é obrigatório', 'error');
    return;
  }

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
    showLoading();
    
    if (editingId) {
      await apiPatch(`/cursos/${editingId}`, data);
      showToast('Curso atualizado com sucesso', 'success');
    } else {
      await apiPost('/cursos', data);
      showToast('Curso criado com sucesso', 'success');
    }
    
    closeModal();
    await loadCursos();
    
    // Se criou um novo curso, verifica se ainda precisa de primeiro acesso
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
    console.error('Erro ao salvar curso:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao salvar curso';
    showToast('Erro: ' + errorMessage, 'error');
  } finally {
    hideLoading();
  }
}

function editCurso(id) {
  showModal(id);
}

async function deleteCurso(id) {
  const curso = cursos.find(c => c.idCurso === id);
  if (!curso) return;
  
  if (!confirm(`Tem certeza que deseja excluir o curso "${curso.nome}"? Esta ação não pode ser desfeita.`)) {
    return;
  }

  try {
    showLoading();
    await apiDelete(`/cursos/${id}`);
    showToast('Curso excluído com sucesso', 'success');
    await loadCursos();
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao excluir curso';
    showToast('Erro: ' + errorMessage, 'error');
  } finally {
    hideLoading();
  }
}

function viewDisciplinas(idCurso) {
  window.location.href = `/disciplinas.html?idCurso=${idCurso}`;
}

function showAddCursoDialog() {
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
window.showAddCursoDialog = showAddCursoDialog;
window.editCurso = editCurso;
window.deleteCurso = deleteCurso;
window.viewDisciplinas = viewDisciplinas;
