// PEDRO
let turmaIdAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  turmaIdAtual = urlParams.get('turmaId');

  await loadTurmas();

  if (turmaIdAtual) {
    document.getElementById('turmaSelect').value = turmaIdAtual;
    await loadComponentes();
  }

  document.getElementById('turmaSelect').addEventListener('change', async (e) => {
    turmaIdAtual = e.target.value;
    if (turmaIdAtual) {
      await loadComponentes();
    } else {
      document.getElementById('componentesContainer').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
    }
  });
});

async function loadTurmas() {
  try {
    const turmas = await apiGet('/turmas');
    const select = document.getElementById('turmaSelect');
    select.innerHTML = '<option value="">Selecione uma turma</option>' +
      turmas.map(t => `<option value="${t.idTurma}">${t.nomeTurma} - ${t.disciplina?.nome || ''}</option>`).join('');
    
    if (turmaIdAtual) {
      select.value = turmaIdAtual;
    }
  } catch (error) {
    showToast('Erro ao carregar turmas', 'error');
  }
}

async function loadComponentes() {
  if (!turmaIdAtual) return;

  try {
    showLoading();
    const [componentes, turma] = await Promise.all([
      apiGet(`/turmas/${turmaIdAtual}/componentes`),
      apiGet(`/turmas/${turmaIdAtual}`)
    ]);

    document.getElementById('disciplinaInfo').textContent = 
      `Disciplina: ${turma.disciplina?.nome || 'N/A'}`;

    const tbody = document.getElementById('componentesTable');
    
    if (componentes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <svg style="width: 3rem; height: 3rem; color: var(--gray-400); margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
            </svg>
            <p class="text-muted mb-0">Nenhum componente cadastrado para esta disciplina</p>
            <small class="text-muted">Cadastre componentes na página de Componentes</small>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = componentes.map(comp => `
        <tr>
          <td style="font-weight: var(--font-semibold);">${comp.sigla}</td>
          <td>${comp.nome}</td>
          <td>
            ${comp.pendentes > 0 
              ? `<span class="badge" style="background: var(--warning-light); color: var(--warning-700); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-medium);">${comp.pendentes} pendente(s)</span>`
              : '<span class="badge" style="background: var(--success-light); color: var(--success-700); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-medium);">Completo</span>'
            }
          </td>
          <td style="text-align: center;">
            <a href="/lancar_notas_grid.html?turmaId=${turmaIdAtual}&componenteId=${comp.idComponente}" 
               class="btn-action btn-action-edit"
               style="text-decoration: none;">Lançar Notas</a>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('componentesContainer').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
  } catch (error) {
    showToast('Erro ao carregar componentes', 'error');
  } finally {
    hideLoading();
  }
}

