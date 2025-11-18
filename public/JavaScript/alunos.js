// RAFAEL
class AlunosManager {
  constructor() {
    this.novoAlunoModal = createModal('novoAlunoModal');
    this.vincularModal = createModal('vincularAlunoModal');
    this.turmaIdAtual = null;
    this.init();
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    this.turmaIdAtual = urlParams.get('turmaId');

    await this.loadTurmas();

    if (this.turmaIdAtual) {
      document.getElementById('turmaSelect').value = this.turmaIdAtual;
      await this.loadAlunos();
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mudança de turma
    document.getElementById('turmaSelect').addEventListener('change', async (e) => {
      this.turmaIdAtual = e.target.value;
      if (this.turmaIdAtual) {
        await this.loadAlunos();
      } else {
        document.getElementById('alunosTable').innerHTML = 
          '<tr><td colspan="4" style="text-align: center; padding: var(--space-12); color: var(--gray-500);">Selecione uma turma para ver os alunos</td></tr>';
        document.getElementById('turmaInfo').textContent = 'Selecione uma turma';
      }
    });

    // Validação em tempo real - Novo Aluno
    const novoAlunoInputs = document.querySelectorAll('#novoAlunoForm input');
    novoAlunoInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });

    // Busca de aluno ao digitar RA para vincular
    const raVincularInput = document.getElementById('raVincular');
    if (raVincularInput) {
      let debounceTimer;
      raVincularInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const ra = raVincularInput.value;
          if (ra && ra.length >= 3) {
            this.buscarAlunoPorRA(ra);
          } else {
            document.getElementById('alunoPreview').style.display = 'none';
          }
        }, 500);
      });
    }
  }

  validateField(field) {
    const value = field.value.trim();
    
    field.classList.remove('error');
    
    if (field.hasAttribute('required') && !value) {
      field.classList.add('error');
      return false;
    }
    
    if (field.type === 'email' && value && !this.isValidEmail(value)) {
      field.classList.add('error');
      return false;
    }
    
    if (field.type === 'number' && value && parseInt(value) < 1) {
      field.classList.add('error');
      return false;
    }
    
    return true;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async loadTurmas() {
    try {
      const turmas = await apiGet('/turmas');
      const select = document.getElementById('turmaSelect');
      select.innerHTML = '<option value="">Selecione uma turma</option>' +
        turmas.map(t => `<option value="${t.idTurma}">${t.nomeTurma} - ${t.disciplina?.nome || ''}</option>`).join('');
      
      if (this.turmaIdAtual) {
        select.value = this.turmaIdAtual;
      }
    } catch (error) {
      showToast('Erro ao carregar turmas', 'error');
      console.error(error);
    }
  }

  async loadAlunos() {
    if (!this.turmaIdAtual) return;

    try {
      showLoading();
      const [matriculas, turma] = await Promise.all([
        apiGet(`/matriculas/turmas/${this.turmaIdAtual}`),
        apiGet(`/turmas/${this.turmaIdAtual}`)
      ]);

      document.getElementById('turmaInfo').textContent = 
        `${turma.nomeTurma} - ${turma.disciplina?.nome || ''}`;

      this.renderAlunos(matriculas);
    } catch (error) {
      showToast('Erro ao carregar alunos', 'error');
      console.error(error);
      document.getElementById('alunosTable').innerHTML = 
        '<tr><td colspan="4" style="text-align: center; padding: var(--space-8); color: var(--error);">Erro ao carregar alunos</td></tr>';
    } finally {
      hideLoading();
    }
  }

  renderAlunos(matriculas) {
    const tbody = document.getElementById('alunosTable');
    
    if (matriculas.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: var(--space-12); color: var(--gray-500);">
            <svg style="width: 3rem; height: 3rem; margin: 0 auto var(--space-4); opacity: 0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <p style="margin: 0; font-size: var(--text-base);">Nenhum aluno matriculado nesta turma</p>
            <p style="margin: var(--space-2) 0 0; font-size: var(--text-sm); color: var(--gray-400);">Clique em "Adicionar Aluno" para começar</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = matriculas
      .filter(m => m.aluno) // Filtra apenas matrículas com aluno válido
      .map(m => {
        const aluno = m.aluno;
        if (!aluno) return ''; // Proteção adicional
        
        const iniciais = aluno.nome ? aluno.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';
        const nomeEscapado = aluno.nome ? aluno.nome.replace(/'/g, "\\'") : 'Aluno desconhecido';
        
        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 2.5rem; height: 2.5rem; background: var(--bg-gradient-blue-4); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; font-weight: var(--font-bold); font-size: var(--text-sm);">
                  ${iniciais}
                </div>
                <div>
                  <div style="font-weight: var(--font-semibold); color: var(--gray-900);">RA ${aluno.ra}</div>
                  <div style="font-size: var(--text-xs); color: var(--gray-500);">Matrícula #${m.idMatricula}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight: var(--font-medium); color: var(--gray-800);">${aluno.nome || '—'}</div>
            </td>
            <td>
              <div style="font-size: var(--text-sm); color: var(--gray-600);">${aluno.email || '—'}</div>
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="alunosManager.verNotas(${m.idMatricula})" class="btn-icon" style="background: var(--info); color: white;" title="Ver Notas">
                  <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </button>
                <button onclick="alunosManager.desvincular(${m.idMatricula}, '${nomeEscapado}')" class="btn-icon" style="background: var(--error); color: white;" title="Desvincular">
                  <svg style="width: 1rem; height: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .filter(html => html !== '') // Remove strings vazias
      .join('');
  }

  openCreateModal() {
    if (!this.turmaIdAtual) {
      showToast('Por favor, selecione uma turma primeiro', 'warning');
      return;
    }

    this.novoAlunoModal.clearErrors();
    this.novoAlunoModal.setTitle('Adicionar Novo Aluno');
    document.getElementById('novoAlunoForm').reset();
    this.novoAlunoModal.open();
  }

  openVincularModal() {
    if (!this.turmaIdAtual) {
      showToast('Por favor, selecione uma turma primeiro', 'warning');
      return;
    }

    this.vincularModal.clearErrors();
    this.vincularModal.setTitle('Vincular Aluno Existente');
    document.getElementById('vincularAlunoForm').reset();
    document.getElementById('alunoPreview').style.display = 'none';
    this.vincularModal.open();
  }

  async buscarAlunoPorRA(ra) {
    try {
      const alunos = await apiGet(`/alunos?ra=${ra}`);
      
      if (alunos && alunos.length > 0) {
        const aluno = alunos[0];
        document.getElementById('alunoPreviewNome').textContent = aluno.nome;
        document.getElementById('alunoPreviewEmail').textContent = aluno.email || 'Sem email cadastrado';
        document.getElementById('alunoPreview').style.display = 'block';
      } else {
        document.getElementById('alunoPreview').style.display = 'none';
      }
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      document.getElementById('alunoPreview').style.display = 'none';
    }
  }

  async submitNovoAluno() {
    if (!this.novoAlunoModal.validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error');
      return;
    }

    const formData = this.novoAlunoModal.getFormData();
    
    if (!formData.email) delete formData.email;

    try {
      this.novoAlunoModal.showButtonLoading(true);
      
      // Cria o aluno
      const novoAluno = await apiPost('/alunos', formData);
      
      // Vincula à turma
      await apiPost('/matriculas', {
        ra: novoAluno.ra,
        idTurma: parseInt(this.turmaIdAtual)
      });
      
      showToast('Aluno criado e vinculado com sucesso!', 'success');
      this.novoAlunoModal.close();
      await this.loadAlunos();
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Erro ao criar aluno', 'error');
    } finally {
      this.novoAlunoModal.showButtonLoading(false);
    }
  }

  async submitVincular() {
    if (!this.vincularModal.validateForm()) {
      showToast('Por favor, preencha o RA do aluno', 'error');
      return;
    }

    const ra = document.getElementById('raVincular').value;

    try {
      this.vincularModal.showButtonLoading(true);
      
      await apiPost('/matriculas', {
        ra: parseInt(ra),
        idTurma: parseInt(this.turmaIdAtual)
      });
      
      showToast('Aluno vinculado com sucesso!', 'success');
      this.vincularModal.close();
      await this.loadAlunos();
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Erro ao vincular aluno', 'error');
    } finally {
      this.vincularModal.showButtonLoading(false);
    }
  }

  async desvincular(idMatricula, nomeAluno) {
    if (!confirm(`Tem certeza que deseja desvincular ${nomeAluno} desta turma?`)) {
      return;
    }

    try {
      showLoading();
      await apiDelete(`/matriculas/${idMatricula}`);
      showToast('Aluno desvinculado com sucesso!', 'success');
      await this.loadAlunos();
    } catch (error) {
      showToast('Erro ao desvincular aluno', 'error');
      console.error(error);
    } finally {
      hideLoading();
    }
  }

  verNotas(idMatricula) {
    window.location.href = `/notas.html?matriculaId=${idMatricula}`;
  }
}

let alunosManager;

document.addEventListener('DOMContentLoaded', () => {
  alunosManager = new AlunosManager();
});
