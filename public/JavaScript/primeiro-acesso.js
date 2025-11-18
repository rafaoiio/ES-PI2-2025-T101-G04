// VITOR
/**
 * Gerenciador da página de primeiro acesso.
 * Verifica se há instituição e curso cadastrados e redireciona se necessário.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await checkFirstAccess();
  
  const checkAgainBtn = document.getElementById('checkAgainBtn');
  if (checkAgainBtn) {
    checkAgainBtn.addEventListener('click', async () => {
      await checkFirstAccess();
    });
  }
});

async function checkFirstAccess() {
  try {
    const response = await apiGet('/dashboard/first-access');
    
    // Debug: log para verificar o que está sendo retornado
    console.log('Resposta do primeiro acesso:', response);
    
    // Verifica se já tem ambos cadastrados
    if (response.hasInstituicao && response.hasCurso) {
      // Já tem instituição e curso, mostra mensagem mas permite navegação manual
      // Não força redirecionamento imediato para não travar o sistema
      const statusDiv = document.querySelector('.status-message');
      if (statusDiv) {
        statusDiv.remove();
      }
      
      const card = document.querySelector('.card-modern');
      if (card) {
        const successDiv = document.createElement('div');
        successDiv.className = 'status-message';
        successDiv.style.cssText = 'margin-top: var(--space-4); padding: var(--space-4); background: var(--success-50); border-left: 4px solid var(--success-500); border-radius: var(--radius-md);';
        successDiv.innerHTML = `
          <p style="margin: 0; color: var(--gray-700); display: flex; align-items: center; gap: var(--space-2);">
            <span style="font-size: 1.2rem;">✅</span>
            <strong>Status:</strong> Configuração concluída! Você pode navegar pelo sistema normalmente.
          </p>
        `;
        
        const checkAgainBtn = document.getElementById('checkAgainBtn');
        if (checkAgainBtn && checkAgainBtn.parentElement) {
          checkAgainBtn.parentElement.insertBefore(successDiv, checkAgainBtn);
        } else {
          card.appendChild(successDiv);
        }
      }
      
      // Opcional: redireciona após um tempo maior, mas não bloqueia
      setTimeout(() => {
        // Só redireciona se ainda estiver na página de primeiro acesso
        if (window.location.pathname.includes('/primeiro-acesso.html')) {
          showToast('Redirecionando para o dashboard...', 'success');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 2000);
        }
      }, 3000);
      return;
    }
    
    // Atualiza a interface com o status atual
    updateFirstAccessStatus(response);
  } catch (error) {
    console.error('Erro ao verificar primeiro acesso:', error);
    showToast('Erro ao verificar configuração inicial', 'error');
  }
}

function updateFirstAccessStatus(response) {
  const card = document.querySelector('.card-modern');
  if (!card) return;
  
  // Remove mensagens anteriores
  const existingStatus = card.querySelector('.status-message');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  // Se já tem ambos, não mostra status (já vai redirecionar)
  if (response.hasInstituicao && response.hasCurso) {
    return;
  }
  
  // Cria mensagem de status com informações corretas
  const statusDiv = document.createElement('div');
  statusDiv.className = 'status-message';
  
  // Define cor e estilo baseado no que falta
  let statusColor = 'var(--primary-500)';
  let statusBg = 'var(--primary-50)';
  
  if (!response.hasInstituicao && !response.hasCurso) {
    statusColor = 'var(--warning-500)';
    statusBg = 'var(--warning-50)';
  } else if (!response.hasInstituicao) {
    statusColor = 'var(--info)';
    statusBg = 'var(--info-light)';
  } else if (!response.hasCurso) {
    statusColor = 'var(--info)';
    statusBg = 'var(--info-light)';
  }
  
  statusDiv.style.cssText = `margin-top: var(--space-4); padding: var(--space-4); background: ${statusBg}; border-left: 4px solid ${statusColor}; border-radius: var(--radius-md);`;
  
  let statusText = '';
  let statusIcon = '';
  
  if (!response.hasInstituicao && !response.hasCurso) {
    statusText = '<strong>Status:</strong> Você precisa cadastrar uma instituição e um curso para começar.';
    statusIcon = '⚠️';
  } else if (!response.hasInstituicao) {
    statusText = '<strong>Status:</strong> Você já cadastrou um curso. Agora precisa cadastrar uma instituição para concluir a configuração.';
    statusIcon = 'ℹ️';
  } else if (!response.hasCurso) {
    statusText = '<strong>Status:</strong> Você já cadastrou uma instituição. Agora precisa cadastrar um curso para concluir a configuração.';
    statusIcon = 'ℹ️';
  }
  
  statusDiv.innerHTML = `<p style="margin: 0; color: var(--gray-700); display: flex; align-items: center; gap: var(--space-2);"><span style="font-size: 1.2rem;">${statusIcon}</span> ${statusText}</p>`;
  
  // Insere antes do botão "Verificar Novamente"
  const checkAgainBtn = document.getElementById('checkAgainBtn');
  if (checkAgainBtn && checkAgainBtn.parentElement) {
    checkAgainBtn.parentElement.insertBefore(statusDiv, checkAgainBtn);
  } else {
    card.appendChild(statusDiv);
  }
}

