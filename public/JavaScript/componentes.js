// LUCAS
let disciplinaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  disciplinaId = urlParams.get('disciplinaId');
  
  await loadDisciplinas();
  
  if (disciplinaId) {
    const select = document.getElementById('disciplinaSelect');
    select.value = disciplinaId;
    await loadComponentes();
    updateNovoBtn();
  }

  document.getElementById('disciplinaSelect').addEventListener('change', async (e) => {
    disciplinaId = e.target.value;
    if (disciplinaId) {
      updateNovoBtn();
      await loadComponentes();
    } else {
      document.getElementById('componentesTable').innerHTML = 
        '<tr><td colspan="3" style="text-align: center; padding: 3rem; color: var(--gray-500);">Selecione uma disciplina para ver os componentes</td></tr>';
      document.getElementById('disciplinaInfo').textContent = 'Selecione uma disciplina para ver os componentes';
      const novoBtn = document.getElementById('novoBtn');
      novoBtn.href = '#';
      novoBtn.onclick = (e) => {
        e.preventDefault();
        showToast('Por favor, selecione uma disciplina primeiro', 'warning');
      };
    }
  });
});

function updateNovoBtn() {
  const novoBtn = document.getElementById('novoBtn');
  if (disciplinaId) {
    novoBtn.href = `/componente_form.html?disciplinaId=${disciplinaId}`;
    novoBtn.onclick = null;
  }
}

async function loadDisciplinas() {
  try {
    const disciplinas = await apiGet('/disciplinas');
    const select = document.getElementById('disciplinaSelect');
    select.innerHTML = '<option value="">Selecione uma disciplina</option>' +
      disciplinas.map(d => `<option value="${d.idDisciplina}">${d.nome}</option>`).join('');
    
    if (disciplinaId) {
      select.value = disciplinaId;
    }
  } catch (error) {
    showToast('Erro ao carregar disciplinas', 'error');
  }
}

async function loadComponentes() {
  if (!disciplinaId) return;
  
  try {
    showLoading();
    const [componentes, disciplina] = await Promise.all([
      apiGet(`/componentes/disciplinas/${disciplinaId}`),
      apiGet(`/disciplinas/${disciplinaId}`)
    ]);
    
    const tbody = document.getElementById('componentesTable');
    document.getElementById('disciplinaInfo').textContent = `Componentes da disciplina: ${disciplina.nome}`;
    
    if (componentes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; padding: 3rem; color: var(--gray-500);">
            <svg style="width: 3rem; height: 3rem; margin: 0 auto 1rem; opacity: 0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
            <p style="margin: 0; font-size: var(--text-base);">Nenhum componente cadastrado</p>
            <p style="margin: var(--space-2) 0 0; font-size: var(--text-sm); color: var(--gray-400);">Clique em "Novo Componente" para começar</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = componentes.map(c => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.5rem; height: 2.5rem; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); font-size: var(--text-sm);">
              ${c.sigla ? c.sigla.substring(0, 2).toUpperCase() : c.nome.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: var(--font-semibold); color: var(--gray-900);">${c.nome}</div>
              ${c.sigla ? `<div style="font-size: var(--text-sm); color: var(--gray-600);">${c.sigla}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          ${c.sigla ? `<span class="tag-rounded tag-sigla">${c.sigla}</span>` : '<span class="tag-rounded tag-sigla-empty">—</span>'}
        </td>
        <td>
          <div class="actions-cell">
            <button onclick="window.location.href='/componente_form.html?id=${c.idComponente}&disciplinaId=${disciplinaId}'" class="action-btn-table action-btn-edit-table" title="Editar componente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onclick="excluirComponente(${c.idComponente})" class="action-btn-table action-btn-delete-table" title="Excluir componente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar componentes:', error);
    showToast('Erro ao carregar componentes', 'error');
    document.getElementById('componentesTable').innerHTML = 
      '<tr><td colspan="3" style="text-align: center; padding: 3rem; color: var(--error);">Erro ao carregar componentes</td></tr>';
  } finally {
    hideLoading();
  }
}

async function excluirComponente(id) {
  if (!confirm('Tem certeza que deseja excluir este componente? Esta ação não pode ser desfeita.')) return;
  
  try {
    showLoading();
    await apiDelete(`/componentes/${id}`);
    showToast('Componente excluído com sucesso!', 'success');
    await loadComponentes();
  } catch (error) {
    console.error('Erro ao excluir componente:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Erro ao excluir componente';
    if (errorMessage.includes('notas') || errorMessage.includes('vinculado')) {
      showToast('Não é possível excluir componente que possui notas lançadas', 'error');
    } else {
      showToast(errorMessage, 'error');
    }
  } finally {
    hideLoading();
  }
}