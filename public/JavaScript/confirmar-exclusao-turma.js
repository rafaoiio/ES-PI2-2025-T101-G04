// RAFAEL
/**
 * Gerenciador da página de confirmação de exclusão de turma.
 * Processa o token recebido por email e confirma a exclusão.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    showError('Token não fornecido na URL');
    return;
  }

  await confirmarExclusao(token);
});

async function confirmarExclusao(token) {
  try {
    showLoading();

    // Chama endpoint de confirmação
    const tokenAuth = localStorage.getItem('notadez_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (tokenAuth) {
      headers['Authorization'] = `Bearer ${tokenAuth}`;
    }

    const response = await fetch(`${API_BASE_URL}/turmas/confirm-delete/${token}`, {
      method: 'POST',
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('notadez_token');
      window.location.href = '/login.html';
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao confirmar exclusão');
    }

    const data = await response.json();

    if (data.message) {
      showSuccess(data.message);
    } else {
      showSuccess('Exclusão confirmada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao confirmar exclusão:', error);
    
    let errorMessage = 'Erro ao confirmar exclusão';
    if (error.message) {
      errorMessage = error.message;
    }

    showError(errorMessage);
  }
}

function showLoading() {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('success-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'none';
}

function showSuccess(message) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('success-state').style.display = 'block';
  document.getElementById('error-state').style.display = 'none';
  
  if (message) {
    showToast(message, 'success');
  }
}

function showError(message) {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('success-state').style.display = 'none';
  document.getElementById('error-state').style.display = 'block';
  document.getElementById('error-message').textContent = message;
  
  showToast(message, 'error');
}

