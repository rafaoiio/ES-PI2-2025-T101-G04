// RAFAEL
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  await loadDisciplinas();
  
  if (id) {
    document.getElementById('pageTitle').textContent = 'Editar Turma';
    await loadTurma(id);
  }

  document.getElementById('turmaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveTurma(id);
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

async function loadTurma(id) {
  try {
    const turma = await apiGet(`/turmas/${id}`);
    document.getElementById('idDisciplina').value = turma.idDisciplina;
    document.getElementById('nomeTurma').value = turma.nomeTurma;
    document.getElementById('horario').value = turma.horario || '';
    document.getElementById('sala').value = turma.sala || '';
    document.getElementById('capacidade').value = turma.capacidade || '';
  } catch (error) {
    showToast('Erro ao carregar turma', 'error');
  }
}

async function saveTurma(id) {
  try {
    showLoading();
    const data = {
      idDisciplina: parseInt(document.getElementById('idDisciplina').value),
      nomeTurma: document.getElementById('nomeTurma').value,
      horario: document.getElementById('horario').value || undefined,
      sala: document.getElementById('sala').value || undefined,
      capacidade: document.getElementById('capacidade').value ? parseInt(document.getElementById('capacidade').value) : undefined,
    };

    if (id) {
      await apiPatch(`/turmas/${id}`, data);
      showToast('Turma atualizada com sucesso!', 'success');
    } else {
      await apiPost('/turmas', data);
      showToast('Turma criada com sucesso!', 'success');
    }

    setTimeout(() => {
      window.location.href = '/turmas.html';
    }, 1000);
  } catch (error) {
    showToast(error.message || 'Erro ao salvar turma', 'error');
  } finally {
    hideLoading();
  }
}

