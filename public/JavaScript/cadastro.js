//Autor: Rafael Gaudencio Dias
// Descrição: Gerencia o cadastro de novos usuários, validando campos e senhas, enviando os dados para /users, 
// exibindo mensagens de sucesso ou erro e limpando o formulário após o registro.

console.log('[cadastro] script carregado');

const USERS_URL = '/users';

const $ = (id) => document.getElementById(id);
const form   = $('formCadastro');
const btn    = $('btnSubmit');
const okBox  = $('msgOk');
const errBox = $('msgErro');

function showMsg(el, text) {
  okBox.style.display = 'none';
  errBox.style.display = 'none';
  el.textContent = String(text ?? '');
  el.style.display = 'block';
}

if (!form) {
  console.error('[cadastro] formCadastro NÃO encontrado no DOM');
  alert('Erro: formulário não encontrado. Verifique o id="formCadastro" e o <script src="/js/cadastro.js" defer>.');
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('[cadastro] submit disparado');

  const nome      = $('nome')?.value.trim();
  const email     = $('email')?.value.trim();
  const senha     = $('senha')?.value;
  const confirmar = $('confirmar')?.value;
  const telefone  = $('telefone')?.value.trim();

  if (!nome || !email || !senha || !confirmar) {
    return showMsg(errBox, 'Preencha todos os campos obrigatórios.');
  }
  if (senha.length < 6) {
    return showMsg(errBox, 'A senha deve ter ao menos 6 caracteres.');
  }
  if (senha !== confirmar) {
    return showMsg(errBox, 'As senhas não conferem.');
  }

  const payload = { nome, email, senha, telefone: telefone || undefined };
  console.log('[cadastro] enviando:', payload);

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const resp = await fetch(USERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('[cadastro] status:', resp.status);

    // Alguns backends retornam 201 sem corpo; trate isso
    let bodyText = await resp.text();
    let json = null;
    try { json = bodyText ? JSON.parse(bodyText) : null; } catch { /* corpo não-JSON */ }

    if (!resp.ok) {
      const msg = json?.message || bodyText || `Falha ao cadastrar (${resp.status}).`;
      return showMsg(errBox, msg);
    }

    // Sucesso
    const user = json || {};
    showMsg(okBox, `Usuário criado! ID: ${user.id ?? '(sem id)'} | E-mail: ${user.email ?? email}`);
    form.reset();
  } catch (err) {
    console.error('[cadastro] erro fetch:', err);
    showMsg(errBox, `Erro de rede: ${err?.message || err}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Conta';
  }
});
