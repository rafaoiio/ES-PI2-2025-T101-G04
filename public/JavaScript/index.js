// VITOR
/**
 * Gerenciador do Dashboard Principal (index.html).
 * 
 * Carrega métricas do sistema e exibe no dashboard principal.
 * Usa a API REST para buscar dados reais do backend.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadMetrics();
});

/**
 * Carrega e exibe as métricas do sistema.
 * 
 * Busca dados do endpoint /dashboard/metrics e atualiza
 * os contadores na interface.
 */
async function loadMetrics() {
  try {
    console.log('[Dashboard] Iniciando carregamento de métricas...');
    showLoading();
    
    // Verifica se API_BASE_URL está definido
    if (typeof API_BASE_URL === 'undefined') {
      console.error('[Dashboard] API_BASE_URL não está definido!');
      throw new Error('API_BASE_URL não está definido');
    }
    
    console.log('[Dashboard] Fazendo requisição para:', `${API_BASE_URL}/dashboard/metrics`);
    const metrics = await apiGet('/dashboard/metrics');
    console.log('[Dashboard] Métricas recebidas:', metrics);
    
    const disciplinasCount = document.getElementById('disciplinasCount');
    const turmasCount = document.getElementById('turmasCount');
    const componentesCount = document.getElementById('componentesCount');
    const alunosCount = document.getElementById('alunosCount');

    console.log('[Dashboard] Elementos DOM encontrados:', {
      disciplinasCount: !!disciplinasCount,
      turmasCount: !!turmasCount,
      componentesCount: !!componentesCount,
      alunosCount: !!alunosCount
    });

    if (disciplinasCount) {
      disciplinasCount.textContent = metrics.disciplinas || 0;
      console.log('[Dashboard] Disciplinas atualizadas:', metrics.disciplinas || 0);
    }
    if (turmasCount) {
      turmasCount.textContent = metrics.turmas || 0;
      console.log('[Dashboard] Turmas atualizadas:', metrics.turmas || 0);
    }
    if (componentesCount) {
      componentesCount.textContent = metrics.componentes || 0;
      console.log('[Dashboard] Componentes atualizados:', metrics.componentes || 0);
    }
    if (alunosCount) {
      alunosCount.textContent = metrics.alunos || 0;
      console.log('[Dashboard] Alunos atualizados:', metrics.alunos || 0);
    }

    // Anima números
    animateNumbers();
    console.log('[Dashboard] Métricas carregadas com sucesso!');
  } catch (error) {
    console.error('[Dashboard] Erro ao carregar métricas:', error);
    console.error('[Dashboard] Detalhes do erro:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    showToast('Erro ao carregar métricas do dashboard: ' + (error.message || 'Erro desconhecido'), 'error');
    
    // Fallback: exibir zeros em caso de erro
    const disciplinasCount = document.getElementById('disciplinasCount');
    const turmasCount = document.getElementById('turmasCount');
    const componentesCount = document.getElementById('componentesCount');
    const alunosCount = document.getElementById('alunosCount');
    
    if (disciplinasCount) disciplinasCount.textContent = '0';
    if (turmasCount) turmasCount.textContent = '0';
    if (componentesCount) componentesCount.textContent = '0';
    if (alunosCount) alunosCount.textContent = '0';
  } finally {
    hideLoading();
  }
}

/**
 * Anima números ao carregar.
 */
function animateNumbers() {
  const counters = document.querySelectorAll('.stat-info h3');
  counters.forEach(counter => {
    const target = parseInt(counter.textContent);
    if (target > 0) {
      let current = 0;
      const increment = target / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current);
        }
      }, 30);
    }
  });
}

