// PEDRO
let turmaId = null;
let componenteId = null;
let auditoriaVisivel = true;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  turmaId = urlParams.get('turmaId');
  componenteId = urlParams.get('componenteId');

  if (!turmaId || !componenteId) {
    showToast('Parâmetros inválidos', 'error');
    window.location.href = '/lancar_notas_select.html';
    return;
  }

  await Promise.all([loadGrid(), loadAuditoria()]);
  
  // Botão para ocultar/exibir painel de auditoria
  const toggleBtn = document.getElementById('toggleAuditoriaBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleAuditoria);
  }
});

async function loadGrid() {
  try {
    showLoading();
    
    if (!turmaId || !componenteId) {
      throw new Error('Turma ou componente não selecionado');
    }
    
    // Adiciona ?readonly=false para permitir edição
    const [gridData, componente, turma] = await Promise.all([
      apiGet(`/lancamentos/${turmaId}/${componenteId}?readonly=false`),
      apiGet(`/componentes/${componenteId}`),
      apiGet(`/turmas/${turmaId}`)
    ]);

    document.getElementById('componenteInfo').textContent = 
      `Componente: ${componente.sigla} - ${componente.nome} | Turma: ${turma.nomeTurma}`;

    const tbody = document.getElementById('notasTable');
    
    // Grid agora retorna objeto com readonly e alunos
    const alunos = gridData.alunos || [];
    
    if (alunos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: var(--space-8);">
            <svg style="width: 3rem; height: 3rem; color: var(--gray-400); margin-bottom: var(--space-4);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p style="color: var(--gray-600); margin: 0 0 var(--space-2);">Nenhum aluno matriculado nesta turma</p>
            <small style="color: var(--gray-500);">Cadastre alunos e matrículas na página de Turmas</small>
          </td>
        </tr>
      `;
      return;
    }

    // Se readonly, desabilita inputs
    const readonly = gridData.readonly === true;
    const inputDisabled = readonly ? 'disabled' : '';
    const buttonDisabled = readonly ? 'disabled' : '';

    tbody.innerHTML = alunos.map(item => {
      const temNota = item.nota !== null && item.nota !== undefined;
      const btnLimpar = temNota && !readonly 
        ? `<button onclick="limparNota(${item.matriculaId})" 
                    class="btn-action btn-action-delete"
                    id="btn-limpar-${item.matriculaId}"
                    title="Limpar nota"
                    style="padding: var(--space-1) var(--space-2);">
             <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <line x1="18" y1="6" x2="6" y2="18"/>
               <line x1="6" y1="6" x2="18" y2="18"/>
             </svg>
           </button>`
        : '';
      
      return `
        <tr id="row-${item.matriculaId}">
          <td style="font-weight: var(--font-medium);">${item.ra}</td>
          <td>${item.nome}</td>
          <td>
            <input type="number" 
                   id="nota-${item.matriculaId}"
                   value="${temNota ? item.nota.toFixed(2) : ''}"
                   min="0" 
                   max="10" 
                   step="0.01"
                   ${inputDisabled}
                   placeholder="—"
                   onkeypress="if(event.key === 'Enter') salvarNota(${item.matriculaId})"
                   onblur="validarNotaInput(${item.matriculaId})"
                   style="width: 100px; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: var(--text-sm); background: ${readonly ? 'var(--gray-100)' : 'white'}; outline: none; transition: all 0.2s ease;">
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: var(--space-2); justify-content: center; align-items: center;">
              <button onclick="salvarNota(${item.matriculaId})" 
                      class="btn-action btn-action-edit"
                      id="btn-${item.matriculaId}"
                      ${buttonDisabled}
                      style="padding: var(--space-2) var(--space-4);">
                Salvar
              </button>
              ${btnLimpar}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (!readonly && alunos.length > 0) {
      document.getElementById('salvarTodasBtn').style.display = 'inline-block';
      document.getElementById('salvarTodasBtn').onclick = salvarTodasNotas;
    }
  } catch (error) {
    console.error('Erro ao carregar grid:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao carregar dados';
    showToast('Erro: ' + errorMessage, 'error');
    const tbody = document.getElementById('notasTable');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: var(--space-8);">
            <div style="background: var(--error-light); border-left: 4px solid var(--error); padding: var(--space-4); border-radius: var(--radius-md);">
              <p style="margin: 0 0 var(--space-3); font-weight: var(--font-semibold); color: var(--gray-900);">Erro ao carregar notas:</p>
              <p style="margin: 0 0 var(--space-4); color: var(--gray-700); font-size: var(--text-sm);">${errorMessage}</p>
              <button class="btn-action btn-action-delete" onclick="loadGrid()" style="padding: var(--space-2) var(--space-4);">
                Tentar Novamente
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  } finally {
    hideLoading();
  }
}

function validarNotaInput(matriculaId) {
  const input = document.getElementById(`nota-${matriculaId}`);
  if (!input) return;
  
  const valor = input.value.trim();
  if (valor === '') {
    input.style.borderColor = 'var(--gray-300)';
    return;
  }
  
  const numValor = parseFloat(valor);
  if (isNaN(numValor) || numValor < 0 || numValor > 10) {
    input.style.borderColor = 'var(--error)';
    setTimeout(() => {
      input.style.borderColor = 'var(--gray-300)';
    }, 3000);
  } else {
    input.style.borderColor = 'var(--gray-300)';
  }
}

async function salvarNota(matriculaId) {
  const input = document.getElementById(`nota-${matriculaId}`);
  if (!input) return;
  
  const valorStr = input.value.trim();
  
  if (valorStr === '') {
    showToast('Digite uma nota ou use o botão "Limpar" para remover', 'warning');
    input.focus();
    return;
  }
  
  const valor = parseFloat(valorStr);

  if (isNaN(valor)) {
    showToast('Nota inválida. Digite um número entre 0.00 e 10.00', 'error');
    input.focus();
    input.style.borderColor = 'var(--error)';
    return;
  }

  if (valor < 0 || valor > 10) {
    showToast('Nota deve estar entre 0.00 e 10.00', 'error');
    input.focus();
    input.style.borderColor = 'var(--error)';
    return;
  }

  try {
    const btn = document.getElementById(`btn-${matriculaId}`);
    btn.disabled = true;
    btn.innerHTML = '<span style="display: inline-block; width: 0.875rem; height: 0.875rem; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>';

    await apiPatch(`/lancamentos/${matriculaId}/${componenteId}`, {
      valor: Math.round(valor * 100) / 100
    });

    showToast('Nota salva com sucesso!', 'success');
    input.style.borderColor = 'var(--gray-300)';
    
    // Recarrega auditoria após salvar nota
    if (auditoriaVisivel) {
      await loadAuditoria();
    }
    
    const row = document.getElementById(`row-${matriculaId}`);
    row.style.background = 'var(--primary-50)';
    setTimeout(() => {
      row.style.background = '';
    }, 2000);
  } catch (error) {
    console.error('Erro ao salvar nota:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao salvar nota';
    showToast('Erro: ' + errorMessage, 'error');
    input.style.borderColor = 'var(--error)';
  } finally {
    const btn = document.getElementById(`btn-${matriculaId}`);
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Salvar';
    }
  }
}

async function limparNota(matriculaId) {
  if (!confirm('Tem certeza que deseja limpar esta nota? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    const btn = document.getElementById(`btn-limpar-${matriculaId}`);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span style="display: inline-block; width: 0.875rem; height: 0.875rem; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>';
    }

    await apiPatch(`/lancamentos/${matriculaId}/${componenteId}`, {
      valor: null
    });

    showToast('Nota removida com sucesso!', 'success');
    
    // Recarrega auditoria após limpar nota
    if (auditoriaVisivel) {
      await loadAuditoria();
    }
    
    await loadGrid();
  } catch (error) {
    showToast('Erro ao remover nota: ' + (error.message || 'Erro desconhecido'), 'error');
    const btn = document.getElementById(`btn-limpar-${matriculaId}`);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg style="width: 0.875rem; height: 0.875rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      `;
    }
  }
}

// Carrega painel de auditoria
async function loadAuditoria() {
  try {
    const auditorias = await apiGet(`/auditoria/turma/${turmaId}`);
    const content = document.getElementById('auditoriaContent');
    
    if (!auditorias || auditorias.length === 0) {
      content.innerHTML = '<p style="color: var(--gray-600); font-size: var(--text-sm);">Nenhuma alteração registrada ainda.</p>';
      return;
    }
    
    // Ordena por data/hora decrescente (já vem ordenado do backend)
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        ${auditorias.map(aud => `
          <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius-md); border-left: 3px solid var(--primary-600);">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: var(--space-4);">
              <span style="font-size: var(--text-sm); color: var(--gray-700); flex: 1;">${aud.mensagem || 'Alteração de nota'}</span>
              <small style="font-size: var(--text-xs); color: var(--gray-500); white-space: nowrap;">${new Date(aud.dataHora).toLocaleString('pt-BR')}</small>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Erro ao carregar auditoria:', error);
    const content = document.getElementById('auditoriaContent');
    if (content) {
      content.innerHTML = '<p style="color: var(--error); font-size: var(--text-sm);">Erro ao carregar auditoria.</p>';
    }
  }
}

// Ocultar/exibir painel de auditoria
function toggleAuditoria() {
  const panel = document.getElementById('auditoriaPanel');
  const btn = document.getElementById('toggleAuditoriaBtn');
  
  if (!panel || !btn) return;
  
  auditoriaVisivel = !auditoriaVisivel;
  
  if (auditoriaVisivel) {
    panel.style.display = 'block';
    btn.textContent = 'Ocultar';
    loadAuditoria(); // Recarrega ao exibir
  } else {
    panel.style.display = 'none';
    btn.textContent = 'Exibir';
  }
}

async function salvarTodasNotas() {
  if (!turmaId || !componenteId) return;

  const alunos = Array.from(document.querySelectorAll('#notasTable tr')).map(tr => {
    const matriculaId = parseInt(tr.id.replace('row-', ''));
    const input = document.getElementById(`nota-${matriculaId}`);
    const valor = input ? parseFloat(input.value) : null;
    return { matriculaId, valor };
  });

  const notasValidas = alunos.filter(a => {
    if (a.valor === null || a.valor === undefined || a.valor === '') return false;
    const numValor = parseFloat(a.valor);
    return !isNaN(numValor) && numValor >= 0 && numValor <= 10;
  });

  if (notasValidas.length === 0) {
    if (!confirm('Nenhuma nota válida encontrada. Deseja continuar mesmo assim?')) {
      return;
    }
    showToast('Nenhuma nota válida para salvar', 'warning');
    return;
  }

  if (!confirm(`Deseja salvar ${notasValidas.length} nota(s)?`)) {
    return;
  }

  try {
    showLoading();
    const btn = document.getElementById('salvarTodasBtn');
    btn.disabled = true;
    btn.innerHTML = '<span style="display: inline-block; width: 0.875rem; height: 0.875rem; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: var(--space-2);"></span>Salvando...';

    const updates = notasValidas.map(a => ({
      matriculaId: a.matriculaId,
      componenteId: componenteId,
      valor: Math.round(a.valor * 100) / 100
    }));

    const resultado = await apiPost('/lancamentos/bulk-update', { updates });

    if (resultado.errors && resultado.errors.length > 0) {
      showToast(`Salvas ${resultado.updated} notas. ${resultado.errors.length} erro(s).`, 'warning');
      console.error('Erros:', resultado.errors);
    } else {
      showToast(`Todas as ${resultado.updated} notas foram salvas com sucesso!`, 'success');
    }

    if (auditoriaVisivel) {
      await loadAuditoria();
    }

    await loadGrid();
  } catch (error) {
    showToast('Erro ao salvar notas: ' + (error.message || 'Erro desconhecido'), 'error');
    console.error(error);
  } finally {
    hideLoading();
    const btn = document.getElementById('salvarTodasBtn');
    btn.disabled = false;
    btn.innerHTML = `
      <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Salvar Todas as Notas
    `;
  }
}

