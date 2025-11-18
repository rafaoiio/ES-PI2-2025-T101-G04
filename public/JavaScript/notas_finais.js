// VITOR
let disciplinaId = null;
let turmaId = null;
let notaAjustadaHabilitada = false;
let notasAjustadasEditaveis = false;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  disciplinaId = urlParams.get('discId');
  turmaId = urlParams.get('turmaId');

  await loadDisciplinas();
  await loadTurmas();

  if (disciplinaId && turmaId) {
    document.getElementById('disciplinaSelect').value = disciplinaId;
    document.getElementById('turmaSelect').value = turmaId;
    await carregarNotasFinais();
  }

  document.getElementById('disciplinaSelect').addEventListener('change', async (e) => {
    disciplinaId = e.target.value;
    await loadTurmas();
    if (disciplinaId && turmaId) {
      await carregarNotasFinais();
    }
  });

  document.getElementById('turmaSelect').addEventListener('change', async (e) => {
    turmaId = e.target.value;
    if (disciplinaId && turmaId) {
      await carregarNotasFinais();
    }
  });
});

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

async function loadTurmas() {
  try {
    const url = disciplinaId ? `/turmas?disciplinaId=${disciplinaId}` : '/turmas';
    const turmas = await apiGet(url);
    const select = document.getElementById('turmaSelect');
    select.innerHTML = '<option value="">Selecione uma turma</option>' +
      turmas.map(t => `<option value="${t.idTurma}">${t.nomeTurma}</option>`).join('');
    
    if (turmaId) {
      select.value = turmaId;
    }
  } catch (error) {
    showToast('Erro ao carregar turmas', 'error');
  }
}

async function carregarNotasFinais() {
  if (!disciplinaId || !turmaId) return;

  try {
    showLoading();
    
    const [notasFinais, disciplina] = await Promise.all([
      apiGet(`/notas-finais/${disciplinaId}/${turmaId}`),
      apiGet(`/disciplinas/${disciplinaId}`)
    ]);

    if (notasFinais.length === 0) {
      document.getElementById('notasTable').innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-5">
            <svg style="width: 3rem; height: 3rem; color: var(--gray-400); margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p class="text-muted mb-0">Nenhum aluno encontrado nesta turma</p>
            <small class="text-muted">Cadastre alunos e matrículas na turma</small>
          </td>
        </tr>
      `;
      return;
    }

    const siglas = Object.keys(notasFinais[0].componentes || {});
    const regra = parseFormulaMedia(disciplina.formulaMedia);
    
    document.getElementById('regraInfo').textContent = 
      regra.tipo === 'SIMPLES' 
        ? 'Média Aritmética Simples' 
        : 'Média Ponderada (com pesos)';

    notaAjustadaHabilitada = disciplina.notaFinalAjustadaHabilitada === 1 || disciplina.notaFinalAjustadaHabilitada === true;
    
    const controlsDiv = document.getElementById('notaAjustadaControls');
    if (controlsDiv) {
      controlsDiv.style.display = 'block';
      const toggle = document.getElementById('toggleNotaAjustada');
      if (toggle) {
        toggle.checked = notaAjustadaHabilitada;
        toggle.onchange = async (e) => {
          await toggleNotaAjustada(e.target.checked);
        };
      }
    }

    const thead = document.getElementById('theadNotas');
    const colunasNotaAjustada = notaAjustadaHabilitada ? '<th><strong>Nota Final Ajustada</strong></th>' : '';
    thead.innerHTML = `
      <tr>
        <th>RA</th>
        <th>Nome</th>
        ${siglas.map(sigla => `<th>${sigla}</th>`).join('')}
        <th><strong>Nota Final</strong></th>
        ${colunasNotaAjustada}
      </tr>
    `;

    const tbody = document.getElementById('notasTable');
    tbody.innerHTML = notasFinais.map(nf => {
      const notaAjustadaCell = notaAjustadaHabilitada 
        ? `<td>
            ${notasAjustadasEditaveis 
              ? `<div style="display: flex; gap: var(--space-2); align-items: center;">
                   <input type="number" 
                          id="nota-ajustada-${nf.idMatricula}"
                          value="${nf.notaFinalAjustada !== null && nf.notaFinalAjustada !== undefined ? formatNotaInput(nf.notaFinalAjustada) : ''}"
                          min="0" 
                          max="10" 
                          step="0.5"
                          onchange="salvarNotaAjustada(${nf.idMatricula}, this.value)"
                          style="width: 100px; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: var(--text-sm); background: white; outline: none; transition: all 0.2s ease;">
                   <button class="btn-action btn-action-edit" onclick="salvarNotaAjustada(${nf.idMatricula}, document.getElementById('nota-ajustada-${nf.idMatricula}').value)" style="padding: var(--space-2) var(--space-3);">
                     Salvar
                   </button>
                 </div>`
              : `<strong style="color: var(--gray-900);">${formatNota(nf.notaFinalAjustada)}</strong>`
            }
          </td>`
        : '';
      
      return `
        <tr>
          <td style="font-weight: var(--font-medium);">${nf.ra}</td>
          <td>${nf.nome}</td>
          ${siglas.map(sigla => `<td style="text-align: center;">${formatNota(nf.componentes[sigla])}</td>`).join('')}
          <td style="text-align: center;"><strong style="color: var(--primary-700); font-size: var(--text-base);">${formatNota(nf.notaFinal)}</strong></td>
          ${notaAjustadaCell}
        </tr>
      `;
    }).join('');

    document.getElementById('notasContainer').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
  } catch (error) {
    showToast('Erro ao carregar notas finais: ' + (error.message || 'Erro desconhecido'), 'error');
    console.error(error);
    document.getElementById('notasContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('emptyState').innerHTML = `
      <div class="card-modern" style="background: var(--error-light); border-left: 4px solid var(--error);">
        <p style="margin: 0 0 var(--space-3); font-weight: var(--font-semibold); color: var(--gray-900);">Erro ao carregar notas finais:</p>
        <p style="margin: 0 0 var(--space-4); color: var(--gray-700); font-size: var(--text-sm);">${error.message || 'Erro desconhecido'}</p>
        <button class="btn-action btn-action-delete" onclick="carregarNotasFinais()" style="padding: var(--space-2) var(--space-4);">
          Tentar Novamente
        </button>
      </div>
    `;
  } finally {
    hideLoading();
  }
}

async function toggleNotaAjustada(habilitar) {
  if (!disciplinaId) return;

  try {
    showLoading();
    await apiPost(`/notas-finais/toggle-ajustada/${disciplinaId}`, { habilitar });
    notaAjustadaHabilitada = habilitar;
    notasAjustadasEditaveis = habilitar;
    showToast(`Notas ajustadas ${habilitar ? 'habilitadas' : 'desabilitadas'}`, 'success');
    await carregarNotasFinais();
  } catch (error) {
    showToast('Erro ao alterar configuração de notas ajustadas', 'error');
    console.error(error);
  } finally {
    hideLoading();
  }
}

async function salvarNotaAjustada(matriculaId, valor) {
  if (!valor || valor.trim() === '') {
    if (!confirm('Deseja limpar a nota ajustada deste aluno?')) {
      return;
    }
    try {
      showLoading();
      await apiPatch(`/notas-finais/ajustada/${matriculaId}`, { notaAjustada: null });
      showToast('Nota ajustada removida com sucesso!', 'success');
      await carregarNotasFinais();
    } catch (error) {
      showToast('Erro ao remover nota ajustada: ' + (error.message || 'Erro desconhecido'), 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
    return;
  }

  const nota = parseFloat(valor);
  
  if (isNaN(nota)) {
    showToast('Nota inválida. Digite um número válido', 'error');
    return;
  }

  if (nota < 0 || nota > 10) {
    showToast('Nota deve estar entre 0.00 e 10.00', 'error');
    return;
  }

  const resto = nota % 0.5;
  if (resto > 0.01 && resto < 0.49) {
    showToast('Nota ajustada deve ser múltiplo de 0,5 (ex: 7.0, 7.5, 8.0)', 'error');
    return;
  }

  try {
    showLoading();
    const input = document.getElementById(`nota-ajustada-${matriculaId}`);
    if (input) {
      input.disabled = true;
    }

    await apiPatch(`/notas-finais/ajustada/${matriculaId}`, { notaAjustada: nota });
    showToast('Nota ajustada salva com sucesso!', 'success');
    await carregarNotasFinais();
  } catch (error) {
    showToast('Erro ao salvar nota ajustada: ' + (error.message || 'Erro desconhecido'), 'error');
    console.error(error);
    const input = document.getElementById(`nota-ajustada-${matriculaId}`);
    if (input) {
      input.disabled = false;
    }
  } finally {
    hideLoading();
  }
}

