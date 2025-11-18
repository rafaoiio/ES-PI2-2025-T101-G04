// LUCAS
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (id) {
    document.getElementById('pageTitle').textContent = 'Editar Disciplina';
    loadDisciplina(id);
  }

  document.getElementById('regra').addEventListener('change', (e) => {
    const pesosContainer = document.getElementById('pesosContainer');
    pesosContainer.style.display = e.target.value === 'PONDERADA' ? 'block' : 'none';
  });

  document.getElementById('disciplinaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveDisciplina(id);
  });
});

async function loadDisciplina(id) {
  try {
    showLoading();
    const disciplina = await apiGet(`/disciplinas/${id}`);
    
    document.getElementById('nome').value = disciplina.nome;
    document.getElementById('sigla').value = disciplina.sigla || '';
    document.getElementById('regra').value = disciplina.regra;
    
    if (disciplina.regra === 'PONDERADA' && disciplina.pesosJson) {
      document.getElementById('pesosContainer').style.display = 'block';
      document.getElementById('pesosJson').value = disciplina.pesosJson;
    }
  } catch (error) {
    showToast('Erro ao carregar disciplina', 'error');
  } finally {
    hideLoading();
  }
}

async function saveDisciplina(id) {
  try {
    showLoading();
    const data = {
      nome: document.getElementById('nome').value,
      sigla: document.getElementById('sigla').value || undefined,
      regra: document.getElementById('regra').value,
      pesosJson: document.getElementById('regra').value === 'PONDERADA' 
        ? document.getElementById('pesosJson').value 
        : undefined,
    };

    if (id) {
      await apiPatch(`/disciplinas/${id}`, data);
      showToast('Disciplina atualizada com sucesso!', 'success');
    } else {
      await apiPost('/disciplinas', data);
      showToast('Disciplina criada com sucesso!', 'success');
    }

    setTimeout(() => {
      window.location.href = '/disciplinas.html';
    }, 1000);
  } catch (error) {
    showToast(error.message || 'Erro ao salvar disciplina', 'error');
  } finally {
    hideLoading();
  }
}