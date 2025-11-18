// VITOR
/**
 * Utilitários compartilhados para o frontend.
 * 
 * Funções auxiliares reutilizáveis em todas as páginas,
 * evitando duplicação e garantindo consistência de comportamento.
 */

/**
 * Exibe uma notificação toast temporária ao usuário.
 * 
 * Cria elemento dinamicamente se o container não existir,
 * garantindo funcionamento mesmo em páginas sem container pré-definido.
 * 
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo do toast ('info', 'success', 'error', 'warning')
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-remoção após 4 segundos: tempo suficiente para leitura
  // sem poluir a interface por muito tempo
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 4000);
}

/**
 * Cria o container de toasts se não existir.
 * 
 * Posicionamento fixo no canto superior direito para não interferir
 * no conteúdo principal.
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 10000;';
  document.body.appendChild(container);
  return container;
}

/**
 * Exibe overlay de loading.
 * 
 * Usa elemento com ID 'loadingOverlay' presente em várias páginas.
 * Se não existir, a função falha silenciosamente (não quebra o fluxo).
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

/**
 * Oculta overlay de loading.
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

/**
 * Parseia a fórmula de média armazenada no banco.
 * 
 * Converte a string formatada (ex: "PONDERADA:{\"P1\":0.4}") em objeto
 * estruturado para uso no frontend.
 * 
 * Tratamento de erro: se JSON inválido, retorna SIMPLES como fallback seguro.
 * 
 * @param {string} formulaMedia - String da fórmula (ex: "SIMPLES" ou "PONDERADA:{...}")
 * @returns {object} Objeto com tipo e pesos (se aplicável)
 */
function parseFormulaMedia(formulaMedia) {
  if (!formulaMedia) {
    return { tipo: 'SIMPLES' };
  }

  if (formulaMedia.startsWith('PONDERADA:')) {
    const pesos = formulaMedia.substring(10);
    try {
      const pesosObj = JSON.parse(pesos);
      return { tipo: 'PONDERADA', pesos: pesosObj };
    } catch (e) {
      // JSON inválido: fallback para SIMPLES
      // Evita quebrar a interface se houver corrupção de dados
      return { tipo: 'SIMPLES' };
    }
  }

  return { tipo: 'SIMPLES' };
}

/**
 * Formata nota numérica para exibição (2 casas decimais, vírgula).
 * 
 * Padrão brasileiro: vírgula como separador decimal.
 * Retorna "—" para valores null/undefined (mais legível que vazio).
 * 
 * @param {number|null|undefined} valor - Nota a ser formatada
 * @returns {string} Nota formatada ou "—"
 */
function formatNota(valor) {
  if (valor === null || valor === undefined) {
    return '—';
  }
  // toFixed(2) garante 2 casas, replace converte ponto para vírgula
  return valor.toFixed(2).replace('.', ',');
}

/**
 * Formata nota numérica para input HTML (2 casas decimais, ponto).
 * 
 * Inputs HTML aceitam apenas ponto como separador decimal,
 * diferente da exibição que usa vírgula.
 * 
 * @param {number|null|undefined} valor - Nota a ser formatada
 * @returns {string} Nota formatada ou string vazia
 */
function formatNotaInput(valor) {
  if (valor === null || valor === undefined) {
    return '';
  }
  // Mantém ponto para compatibilidade com input[type="number"]
  return valor.toFixed(2);
}
