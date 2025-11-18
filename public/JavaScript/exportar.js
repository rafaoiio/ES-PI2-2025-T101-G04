// VITOR
let disciplinaId = null;
let turmaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  disciplinaId = urlParams.get('discId');
  turmaId = urlParams.get('turmaId');

  await loadDisciplinas();
  await loadTurmas();

  if (disciplinaId && turmaId) {
    document.getElementById('disciplinaSelect').value = disciplinaId;
    document.getElementById('turmaSelect').value = turmaId;
  }

  document.getElementById('disciplinaSelect').addEventListener('change', async (e) => {
    disciplinaId = e.target.value;
    await loadTurmas();
  });

  document.getElementById('turmaSelect').addEventListener('change', async (e) => {
    turmaId = e.target.value;
    if (turmaId && disciplinaId) {
      await verificarPendenciasEAvisar();
    } else {
      document.getElementById('alertPendencias').style.display = 'none';
    }
  });
});

async function verificarPendenciasEAvisar() {
  const pendencias = await verificarPendencias();
  if (pendencias.temPendencias) {
    if (pendencias.componentes) {
      mostrarPendencias(pendencias.componentes.map(c => ({
        sigla: c.sigla,
        faltantes: c.pendentes
      })));
    }
    if (pendencias.alunosSemNotaFinal) {
      mostrarAlunosSemNotaFinal(pendencias.alunosSemNotaFinal);
    }
  } else {
    document.getElementById('alertPendencias').style.display = 'none';
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

async function verificarPendencias() {
  if (!disciplinaId || !turmaId) {
    return { temPendencias: false };
  }

  try {
    const componentes = await apiGet(`/turmas/${turmaId}/componentes`);
    const componentesComPendencia = componentes.filter(c => c.pendentes > 0);
    
    if (componentesComPendencia.length > 0) {
      return {
        temPendencias: true,
        componentes: componentesComPendencia
      };
    }

    const notasFinais = await apiGet(`/notas-finais/${disciplinaId}/${turmaId}`);
    const alunosSemNotaFinal = notasFinais.filter(nf => nf.notaFinal === null || nf.notaFinal === undefined);
    
    if (alunosSemNotaFinal.length > 0) {
      return {
        temPendencias: true,
        alunosSemNotaFinal: alunosSemNotaFinal
      };
    }

    return { temPendencias: false };
  } catch (error) {
    console.error('Erro ao verificar pendências:', error);
    return { temPendencias: false };
  }
}

async function exportarCSV() {
  if (!disciplinaId || !turmaId) {
    showToast('Selecione uma disciplina e uma turma', 'error');
    return;
  }

  const pendencias = await verificarPendencias();
  if (pendencias.temPendencias) {
    if (pendencias.componentes) {
      mostrarPendencias(pendencias.componentes.map(c => ({
        sigla: c.sigla,
        faltantes: c.pendentes
      })));
    }
    if (pendencias.alunosSemNotaFinal) {
      mostrarAlunosSemNotaFinal(pendencias.alunosSemNotaFinal);
    }
    if (!confirm('Existem pendências. Deseja continuar mesmo assim?')) {
      return;
    }
  }

  try {
    showLoading();
    const btn = document.getElementById('btnExportarCSV');
    btn.disabled = true;
    btn.textContent = 'Exportando...';

    const token = localStorage.getItem('notadez_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/exportacao/${disciplinaId}/${turmaId}/csv`, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('notadez_token');
      window.location.href = '/login.html';
      return;
    }

    if (response.status === 409) {
      const error = await response.json();
      // Trata pendências de componentes ou Nota Final não calculada
      if (error.pendencias) {
        mostrarPendencias(error.pendencias);
      }
      if (error.alunosSemNotaFinal) {
        mostrarAlunosSemNotaFinal(error.alunosSemNotaFinal);
      }
      if (error.message) {
        showToast(error.message, 'error');
      } else {
        showToast('Não é possível exportar enquanto houver pendências', 'error');
      }
      return;
    }

    if (!response.ok) {
      throw new Error('Erro ao exportar');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `notas_${new Date().toISOString().slice(0, 10)}.csv`;
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+)"/);
      if (matches) {
        filename = matches[1];
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Arquivo CSV exportado com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao exportar CSV: ' + (error.message || 'Erro desconhecido'), 'error');
    console.error(error);
  } finally {
    const btn = document.getElementById('btnExportarCSV');
    btn.disabled = false;
    btn.textContent = 'Exportar CSV';
    hideLoading();
  }
}

function mostrarPendencias(pendencias) {
  if (!pendencias || pendencias.length === 0) {
    return;
  }

  const lista = document.getElementById('listaPendencias');
  const items = pendencias.map(p => 
    `<li style="margin-bottom: var(--space-1);"><strong style="color: var(--gray-900);">${p.sigla}</strong>: ${p.faltantes} nota(s) faltante(s)</li>`
  ).join('');
  
  lista.innerHTML = items;
  document.getElementById('alertPendencias').style.display = 'block';
}

function mostrarAlunosSemNotaFinal(alunos) {
  if (!alunos || alunos.length === 0) {
    return;
  }

  const lista = document.getElementById('listaPendencias');
  const items = alunos.map(a => 
    `<li style="margin-bottom: var(--space-1);"><strong style="color: var(--gray-900);">${a.nome}</strong> (RA: ${a.ra}): Nota Final não calculada</li>`
  ).join('');
  
  lista.innerHTML = items;
  document.getElementById('alertPendencias').style.display = 'block';
}

// Exportação JSON
async function exportarJSON() {
  if (!disciplinaId || !turmaId) {
    showToast('Selecione uma disciplina e uma turma', 'error');
    return;
  }

  const pendencias = await verificarPendencias();
  if (pendencias.temPendencias) {
    if (pendencias.componentes) {
      mostrarPendencias(pendencias.componentes.map(c => ({
        sigla: c.sigla,
        faltantes: c.pendentes
      })));
    }
    if (pendencias.alunosSemNotaFinal) {
      mostrarAlunosSemNotaFinal(pendencias.alunosSemNotaFinal);
    }
    if (!confirm('Existem pendências. Deseja continuar mesmo assim?')) {
      return;
    }
  }

  try {
    showLoading();
    const btn = document.getElementById('btnExportarJSON');
    btn.disabled = true;
    btn.textContent = 'Exportando...';

    const token = localStorage.getItem('notadez_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/exportacao/${disciplinaId}/${turmaId}/json`, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('notadez_token');
      window.location.href = '/login.html';
      return;
    }

    if (response.status === 409) {
      const error = await response.json();
      // Trata pendências de componentes ou Nota Final não calculada
      if (error.pendencias) {
        mostrarPendencias(error.pendencias);
      }
      if (error.alunosSemNotaFinal) {
        mostrarAlunosSemNotaFinal(error.alunosSemNotaFinal);
      }
      if (error.message) {
        showToast(error.message, 'error');
      } else {
        showToast('Não é possível exportar enquanto houver pendências', 'error');
      }
      return;
    }

    if (!response.ok) {
      throw new Error('Erro ao exportar');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `notas_${new Date().toISOString().slice(0, 10)}.json`;
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+)"/);
      if (matches) {
        filename = matches[1];
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Arquivo JSON exportado com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao exportar JSON: ' + (error.message || 'Erro desconhecido'), 'error');
    console.error(error);
  } finally {
    const btn = document.getElementById('btnExportarJSON');
    btn.disabled = false;
    btn.textContent = 'Exportar JSON';
    hideLoading();
  }
}

