//Autor: Rafael Gaudencio Dias
// Descrição: Gerencia o cadastro de novos usuários, validando campos e senhas, enviando os dados para /users, 
// exibindo mensagens de sucesso ou erro e limpando o formulário após o registro.

const USERS_URL = '/users';

const $ = (id) => document.getElementById(id);
const form   = $('formCadastro');
const btn    = $('btnSubmit');
const okBox  = $('msgOk');
const errBox = $('msgErro');

function showMsg(el, text) {
  okBox.style.display = 'none';
  errBox.style.display = 'none';
  el.textContent = text;
  el.style.display = 'block';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name     = $('nome').value.trim();
  const email    = $('email').value.trim();
  const password = $('senha').value;
  const confirm  = $('confirmar').value;
  const phone    = $('telefone').value.trim();

  if (!name || !email || !password || !confirm) {
    return showMsg(errBox, 'Preencha todos os campos obrigatórios.');
  }
  if (password.length < 6) {
    return showMsg(errBox, 'A senha deve ter ao menos 6 caracteres.');
  }
  if (password !== confirm) {
    return showMsg(errBox, 'As senhas não conferem.');
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const resp = await fetch(USERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone: phone || undefined }),
    });

    if (resp.ok) {
      const user = await resp.json();
      showMsg(okBox, `Usuário criado! ID: ${user.id} | E-mail: ${user.email}`);
      form.reset();
      return;
    }

    // Erros conhecidos da API
    if (resp.status === 409) {
      const j = await resp.json().catch(() => ({}));
      return showMsg(errBox, j.message || 'E-mail já cadastrado.');
    }
    if (resp.status === 400) {
      const j = await resp.json().catch(() => ({}));
      const detail = Array.isArray(j.message) ? j.message.join('; ') : (j.message || 'Dados inválidos.');
      return showMsg(errBox, detail);
    }

    // Fallback
    const txt = await resp.text().catch(() => '');
    showMsg(errBox, `Falha ao cadastrar (${resp.status}). ${txt}`);
  } catch (err) {
    showMsg(errBox, `Erro de rede: ${err?.message || err}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar Conta';
  }
});
