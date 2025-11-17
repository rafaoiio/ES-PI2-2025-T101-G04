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
    const disciplinas = await apiGet('/disciplinas');
    const select = document.getElementById('idDisciplina');
    select.innerHTML = disciplinas.map(d => 
      `<option value="${d.idDisciplina}">${d.nome}</option>`
    ).join('');
  } catch (error) {
    showToast('Erro ao carregar disciplinas', 'error');
  }
}

async function loadComponente(id) {
  try {
    const componente = await apiGet(`/componentes/${id}`);
    if (componente) {
      document.getElementById('idDisciplina').value = componente.idDisciplina;
      document.getElementById('nome').value = componente.nome;
      document.getElementById('sigla').value = componente.sigla || '';
    }
  } catch (error) {
    showToast('Erro ao carregar componente', 'error');
  }
}

async function saveComponente(id) {
  try {
    showLoading();
    const data = {
      idDisciplina: parseInt(document.getElementById('idDisciplina').value),
      nome: document.getElementById('nome').value,
      sigla: document.getElementById('sigla').value,
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
    showToast(error.message || 'Erro ao salvar componente', 'error');
  } finally {
    hideLoading();
  }
}