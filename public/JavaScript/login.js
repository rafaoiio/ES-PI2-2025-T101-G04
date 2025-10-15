//Autor: Rafael Gaudencio Dias
// Descrição: Controla o envio do formulário de login, valida os campos, faz a requisição à rota /auth/login, 
// salva o token e os dados do usuário no navegador e redireciona para a área logada.

const LOGIN_URL = '/auth/login';
const ME_URL = '/auth/me'; // para validar depois

const $ = (id) => document.getElementById(id);
const form = $('formLogin');
const btn  = $('btnLogin');
const ok   = $('msgOk');
const err  = $('msgErro');

function show(el, text) {
  ok.style.display = 'none';
  err.style.display = 'none';
  el.textContent = text;
  el.style.display = 'block';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('email').value.trim();
  const password = $('senha').value;

  if (!email || !password) return show(err, 'Informe e-mail e senha.');

  btn.disabled = true; btn.textContent = 'Entrando...';

  try {
    const resp = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!resp.ok) {
      const j = await resp.json().catch(() => ({}));
      return show(err, j.message || `Falha no login (${resp.status}).`);
    }

    const data = await resp.json(); // { accessToken, user }
    localStorage.setItem('nd_token', data.accessToken);
    localStorage.setItem('nd_user', JSON.stringify(data.user));

    show(ok, 'Login realizado com sucesso!');
    setTimeout(() => { window.location.href = '/home.html'; }, 600);
  } catch (e) {
    show(err, `Erro de rede: ${e?.message || e}`);
  } finally {
    btn.disabled = false; btn.textContent = 'Entrar';
  }
});
