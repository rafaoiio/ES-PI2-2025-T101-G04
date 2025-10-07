---

# 📘 Projeto NotaDez – Projeto Integrador 2 (2025)

## 🧩 Descrição Geral

O **NotaDez** é um sistema web desenvolvido como parte do **Projeto Integrador 2 (PI2)** do curso de **Engenharia de Software – PUC-Campinas (2025)**.

O objetivo principal é oferecer aos docentes uma plataforma moderna, intuitiva e segura para **gestão de notas e turmas**, permitindo:

* 👩‍🏫 Cadastro e gerenciamento de **instituições, disciplinas e turmas**;
* 📥 Importação e exportação de **alunos** via **CSV** ou **JSON**;
* 🧮 Criação e lançamento de **componentes de nota** (provas, trabalhos, etc.);
* ➗ **Cálculo automático da nota final**, com base em expressões matemáticas personalizadas;
* ✏️ **Ajuste manual** de notas finais com arredondamento automático;
* 🧾 **Painel de auditoria** que registra todas as alterações feitas nas notas;
* 💾 **Exportação** de resultados em formato **CSV** ou **JSON**.

---

## 👥 Equipe de Desenvolvimento

| Nome                                 | Função                  |
| ------------------------------------ | ----------------------- |
| **Laura Cristine Soares**            | Desenvolvedora Frontend |
| **Lucas David de Souza**             | Desenvolvedor Backend   |
| **Pedro Henrique Medeiros dos Reis** | Desenvolvedor Backend   |
| **Rafael Gaudencio Dias**            | Desenvolvedor Fullstack |
| **Vitor Hugo Gilbert**               | Designer e Documentação |

---

## 🛠️ Tecnologias Utilizadas

* ⚙️ **Backend:** Node.js (LTS) + TypeScript + Express + NestJS
* 🎨 **Frontend:** HTML5, CSS3, Bootstrap
* 🗄️ **Banco de Dados:** MySQL / PostgreSQL
* 💻 **IDE:** Visual Studio Code / JetBrains WebStorm
* 🌳 **Versionamento:** Git + GitHub
* 📋 **Gestão:** GitHub Projects (Kanban)

---

## 📂 Estrutura do Projeto

```
/backend        → Código do servidor (API, controladores, rotas)
/frontend       → Interface web (HTML, CSS, Bootstrap)
/database       → Scripts SQL e modelos ER
/docs           → Documentos de apoio (escopo, diagramas, atas)
/README.md      → Documento descritivo do projeto
```

---

## 🚀 Como Rodar o Projeto

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/SEU-GRUPO/ES-PI2-2025-T101-G04.git
cd ES-PI2-2025-T101-G04
```

### 2️⃣ Instalar as dependências do backend

```bash
cd backend
npm install
npm install express @types/express
```

> ⚠️ Esses pacotes são obrigatórios para o uso do decorador `@Res()` no NestJS (envio de arquivos HTML).

### 3️⃣ Executar o servidor

```bash
npm run start:dev
```

### 4️⃣ Banco de Dados

* Execute os scripts SQL da pasta `/database`.
* Configure as credenciais no arquivo `.env` do backend.

### 5️⃣ Abrir o frontend

Abra os arquivos da pasta `/public` diretamente no navegador ou sirva-os via servidor local.

---

## 🧪 Funcionalidades Implementadas

* [x] 🔑 Autenticação (login, cadastro e recuperação de senha);
* [x] 🏫 Cadastro e gerenciamento de instituições, disciplinas e turmas;
* [x] 📥 Importação de alunos (CSV/JSON);
* [x] 📝 Cadastro e lançamento de notas;
* [x] 📊 Painel de auditoria (log de alterações);
* [x] ➗ Cálculo automático da nota final (expressões matemáticas);
* [x] ✏️ Coluna de notas ajustadas (arredondamento e correção manual);
* [x] 📤 Exportação de notas (CSV/JSON).

---

## 📌 Organização e Controle

* **Commits:** feitos em branches de funcionalidade (`feature/...`).
* **Integração:** merge na branch `dev` após revisão.
* **Entrega final:** branch `main` com tag `1.0.0-final`.
* **Gestão:** GitHub Projects (To Do / In Progress / Review / Done).

---

## 🧾 Boas Práticas e Padrões

* Cada arquivo possui cabeçalho com **autor, descrição e data**, conforme as regras do PI2.
* Exemplo de cabeçalho:

  ```ts
  // Autor: Nome do Aluno
  // Descrição: adicionei uma função X
  // Data: 07/10/2025
  ```
* Comentários explicativos foram incluídos ao longo do código conforme a norma do Projeto Integrador.

---

## 📅 Status Atual

| Etapa                             | Situação               |
| --------------------------------- | ---------------------- |
| Repositório no GitHub             | ✅ Concluído            |
| Modelagem do Banco de Dados (DER) | ✅ Concluído            |
| Protótipo no Figma                | ✅ Concluído            |
| Backend (NestJS + Express)        | ⬜ Em desenvolvimento   |
| Frontend (HTML/CSS/Bootstrap)     | ⬜ Em desenvolvimento   |
| Integração e Testes               | ⬜ Pendente             |
| Versão Final para Banca           | ⬜ Aguardando conclusão |

---

