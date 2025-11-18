// RAFAEL
let turmaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  turmaId = urlParams.get('id');

  if (!turmaId) {
    showToast('ID da turma não informado', 'error');
    window.location.href = '/turmas.html';
    return;
  }

  await loadTurmaHub();
});

async function loadTurmaHub() {
  try {
    showLoading();
    
    const [turma, overview] = await Promise.all([
      apiGet(`/turmas/${turmaId}`),
      apiGet(`/turmas/${turmaId}/overview`)
    ]);

    document.getElementById('turmaNome').textContent = turma.nomeTurma;
    document.getElementById('turmaDisciplina').textContent = `Disciplina: ${turma.disciplina?.nome || 'N/A'}`;
    document.getElementById('totalAlunos').textContent = overview.alunosCount;

    const tbody = document.getElementById('componentesTable');
    if (overview.componentes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: var(--space-8); color: var(--gray-500);">Nenhum componente cadastrado para esta disciplina</td></tr>';
    } else {
      tbody.innerHTML = overview.componentes.map(comp => `
        <tr>
          <td><strong style="color: var(--gray-900);">${comp.sigla}</strong></td>
          <td style="color: var(--gray-700);">${comp.nome || 'N/A'}</td>
          <td style="color: var(--gray-600);">${comp.peso || 1}</td>
          <td>
            ${comp.pendentes > 0 
              ? `<span class="badge-modern badge-warning">${comp.pendentes} pendente(s)</span>`
              : '<span class="badge-modern badge-success">Completo</span>'
            }
          </td>
          <td class="text-end">
            <a href="/lancar_notas_grid.html?turmaId=${turmaId}&componenteId=${comp.idComponente}" 
               class="btn-secondary" style="padding: var(--space-2) var(--space-4); font-size: var(--text-sm);">
              <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Lançar
            </a>
          </td>
        </tr>
      `).join('');
    }

    document.getElementById('btnGerenciarAlunos').href = `/alunos.html?turmaId=${turmaId}`;
    document.getElementById('btnLancarNotas').href = `/lancar_notas_select.html?turmaId=${turmaId}`;
    document.getElementById('btnNotasFinais').href = `/notas_finais.html?turmaId=${turmaId}&discId=${turma.idDisciplina}`;
    document.getElementById('btnExportar').href = `/exportar.html?turmaId=${turmaId}&discId=${turma.idDisciplina}`;

  } catch (error) {
    showToast('Erro ao carregar informações da turma', 'error');
    console.error(error);
  } finally {
    hideLoading();
  }
}

