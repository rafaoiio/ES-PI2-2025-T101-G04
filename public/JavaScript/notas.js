// PEDRO
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadEstatisticas(),
    loadPendencias()
  ]);
});

async function loadEstatisticas() {
  try {
    // Usa as métricas do dashboard que já filtra por professor
    const metrics = await apiGet('/dashboard/metrics');

    document.getElementById('totalTurmas').textContent = metrics.turmas || 0;
    document.getElementById('totalDisciplinas').textContent = metrics.disciplinas || 0;
    document.getElementById('totalComponentes').textContent = metrics.componentes || 0;
    document.getElementById('totalAlunos').textContent = metrics.alunos || 0;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    showToast('Erro ao carregar estatísticas', 'error');
    
    // Fallback: exibir zeros em caso de erro
    document.getElementById('totalTurmas').textContent = '0';
    document.getElementById('totalDisciplinas').textContent = '0';
    document.getElementById('totalComponentes').textContent = '0';
    document.getElementById('totalAlunos').textContent = '0';
  }
}

async function loadPendencias() {
  try {
    showLoading();
    const turmas = await apiGet('/turmas');
    const container = document.getElementById('pendenciasContainer');

    if (!turmas || turmas.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <svg style="width: 3rem; height: 3rem; color: var(--gray-400); margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p class="text-muted">Nenhuma turma encontrada.</p>
        </div>
      `;
      return;
    }

    const pendencias = [];
    
    for (const turma of turmas) {
      try {
        const componentes = await apiGet(`/turmas/${turma.idTurma}/componentes`);
        const componentesComPendencia = componentes.filter(c => c.pendentes > 0);
        
        if (componentesComPendencia.length > 0) {
          const totalPendentes = componentesComPendencia.reduce((sum, c) => sum + c.pendentes, 0);
          pendencias.push({
            turma,
            componentes: componentesComPendencia,
            totalPendentes
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar componentes da turma ${turma.idTurma}:`, error);
      }
    }

    if (pendencias.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--space-8);">
          <svg style="width: 3rem; height: 3rem; color: var(--gray-400); margin-bottom: var(--space-4);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p style="color: var(--gray-600); font-size: var(--text-base); margin: 0 0 var(--space-2);">
            <strong>Nenhuma pendência encontrada</strong>
          </p>
          <p style="color: var(--gray-500); font-size: var(--text-sm); margin: 0;">
            Não há componentes com notas pendentes no momento.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="table-modern">
        <thead>
          <tr>
            <th>Turma</th>
            <th>Disciplina</th>
            <th>Componentes com Pendências</th>
            <th>Total de Pendências</th>
            <th style="text-align: center;">Ação</th>
          </tr>
        </thead>
        <tbody>
          ${pendencias.map(p => `
            <tr>
              <td style="font-weight: var(--font-semibold);">${p.turma.nomeTurma}</td>
              <td>${p.turma.disciplina?.nome || 'N/A'}</td>
              <td>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                  ${p.componentes.map(c => `
                    <span class="badge" style="background: var(--warning-light); color: var(--warning-700); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-medium);">${c.sigla} (${c.pendentes})</span>
                  `).join('')}
                </div>
              </td>
              <td>
                <span class="badge" style="background: var(--error-light); color: var(--error-700); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--font-semibold);">${p.totalPendentes}</span>
              </td>
              <td style="text-align: center;">
                <a href="/lancar_notas_select.html?turmaId=${p.turma.idTurma}" 
                   class="btn-action btn-action-edit"
                   style="text-decoration: none;">
                  Lançar Notas
                </a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Erro ao carregar pendências:', error);
    const container = document.getElementById('pendenciasContainer');
    container.innerHTML = `
      <div class="card-modern" style="background: var(--error-light); border-left: 4px solid var(--error);">
        <p style="margin: 0 0 var(--space-3); font-weight: var(--font-semibold); color: var(--gray-900);">Erro ao carregar pendências:</p>
        <p style="margin: 0 0 var(--space-4); color: var(--gray-700); font-size: var(--text-sm);">${error.message || 'Erro desconhecido'}</p>
        <button class="btn-action btn-action-delete" onclick="loadPendencias()" style="padding: var(--space-2) var(--space-4);">
          Tentar Novamente
        </button>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

