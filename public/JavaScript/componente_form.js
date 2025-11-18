// LUCAS
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const disciplinaId = urlParams.get('disciplinaId');
  
  await loadDisciplinas();
  
  if (id) {
    document.getElementById('pageTitle').textContent = 'Editar Componente';
    await loadComponente(id);
  } else if (disciplinaId) {
    document.getElementById('idDisciplina').value = disciplinaId;
  }

  document.getElementById('componenteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveComponente(id);
  });
});

async function loadDisciplinas() {
  try {
    showLoading();
    const disciplinas = await apiGet('/disciplinas');
    const select = document.getElementById('idDisciplina');
    select.innerHTML = '<option value="">Selecione uma disciplina</option>' + disciplinas.map(d => 
      `<option value="${d.idDisciplina}">${d.nome}${d.sigla ? ' (' + d.sigla + ')' : ''}</option>`
    ).join('');
    
    const urlParams = new URLSearchParams(window.location.search);
    const disciplinaId = urlParams.get('disciplinaId');
    if (disciplinaId) {
      select.value = disciplinaId;
    }
  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error);
    showToast('Erro ao carregar disciplinas: ' + (error.message || 'Erro desconhecido'), 'error');
  } finally {
    hideLoading();
  }
}

async function loadComponente(id) {
  try {
    showLoading();
    const componente = await apiGet(`/componentes/${id}`);
    if (componente) {
      document.getElementById('idDisciplina').value = componente.idDisciplina;
      document.getElementById('nome').value = componente.nome;
      document.getElementById('sigla').value = componente.sigla || '';
    }
  } catch (error) {
    console.error('Erro ao carregar componente:', error);
    showToast('Erro ao carregar componente: ' + (error.message || 'Erro desconhecido'), 'error');
  } finally {
    hideLoading();
  }
}

async function saveComponente(id) {
  const nomeInput = document.getElementById('nome');
  const siglaInput = document.getElementById('sigla');
  const disciplinaSelect = document.getElementById('idDisciplina');
  
  // Validações básicas
  if (!disciplinaSelect.value) {
    showToast('Selecione uma disciplina', 'error');
    disciplinaSelect.focus();
    return;
  }
  
  if (!nomeInput.value.trim()) {
    showToast('Digite o nome do componente', 'error');
    nomeInput.focus();
    return;
  }
  
  if (!siglaInput.value.trim()) {
    showToast('Digite a sigla do componente', 'error');
    siglaInput.focus();
    return;
  }
  
  try {
    showLoading();
    const data = {
      idDisciplina: parseInt(disciplinaSelect.value),
      nome: nomeInput.value.trim(),
      sigla: siglaInput.value.trim().toUpperCase(),
    };

    if (id) {
      await apiPatch(`/componentes/${id}`, data);
      showToast('Componente atualizado com sucesso!', 'success');
    } else {
      await apiPost('/componentes', data);
      showToast('Componente criado com sucesso!', 'success');
    }

    setTimeout(() => {
      window.location.href = `/componentes.html?disciplinaId=${data.idDisciplina}`;
    }, 1000);
  } catch (error) {
    console.error('Erro ao salvar componente:', error);
    const errorMessage = error.message || error.error?.message || 'Erro desconhecido ao salvar componente';
    if (errorMessage.includes('sigla') || errorMessage.includes('duplicad')) {
      showToast('Já existe um componente com esta sigla nesta disciplina. Escolha outra sigla.', 'error');
      siglaInput.focus();
    } else {
      showToast('Erro: ' + errorMessage, 'error');
    }
  } finally {
    hideLoading();
  }
}

