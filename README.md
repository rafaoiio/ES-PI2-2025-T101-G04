# 📘 Projeto NotaDez – PI2

## 📌 Descrição
O **NotaDez** é um sistema web desenvolvido como parte do **Projeto Integrador 2 (PI2)** do curso de **Engenharia de Software – PUC-Campinas (2025)**.  

O objetivo é oferecer aos docentes uma ferramenta prática e integrada para:  
- Gerenciar instituições, disciplinas e turmas;  
- Cadastrar ou importar alunos via CSV/JSON;  
- Criar e lançar notas em diferentes componentes (provas, trabalhos, etc.);  
- Calcular notas finais automaticamente (com fórmula definida pelo professor);  
- Ajustar notas finais quando necessário;  
- Exportar dados em **CSV** ou **JSON**;  
- Garantir rastreabilidade através de um painel de auditoria de alterações.  

---

## 👥 Equipe
- **Laura Cristine Soares**  
- **Lucas David de Souza**
- **Pedro Henrique Medeiros dos Reis**  
- **Rafael Gaudencio Dias** 
- **Vitor Hugo Gilbert**

---

## 🛠️ Tecnologias Utilizadas
- ⚙️ **Backend:** Node.js (LTS) + TypeScript  
- 🎨 **Frontend:** HTML5, CSS3, Bootstrap  
- 🗄️ **Banco de Dados:** MySQL / PostgreSQL  
- 🖥️ **IDE:** Visual Studio Code / WebStorm  
- 🌳 **Versionamento:** Git + GitHub  
- 📋 **Gestão do Projeto:** GitHub Projects (Kanban)  

---

## 📂 Estrutura do Projeto
```
/backend        → Código do servidor (API, regras de negócio)
/frontend       → Interface web (HTML, CSS, Bootstrap)
/database       → Scripts SQL e modelo ER
/docs           → Documentos de apoio (escopo, diagramas, atas)
/README.md      → Este arquivo
```

---

## 🚀 Como Rodar o Projeto (Instruções Básicas)
1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/SEU-GRUPO/ES-PI2-2025-T101-G04.git
   ```
2. **Entrar na pasta do projeto:**
   ```bash
   cd ES-PI2-2025-TX-GXX
   ```
3. **Instalar dependências do backend:**
   ```bash
   cd backend
   npm install
   ```
4. **Rodar o servidor:**
   ```bash
   npm run dev
   ```
5. **Banco de dados:**
   - Executar os scripts SQL da pasta `/database`.
   - Configurar credenciais no arquivo `.env`.

6. **Abrir o frontend:**
   - Abrir os arquivos da pasta `/frontend` no navegador.

---

## 🧪 Funcionalidades (Requisitos Atendidos)
- [ ] 🔑 Autenticação de usuários (login + cadastro + recuperação de senha).  
- [ ] 🏫 Cadastro e gerenciamento de instituições, disciplinas e turmas.  
- [ ] 📥 Importação de alunos (CSV/JSON).  
- [ ] 📝 Cadastro e lançamento de notas (componentes).  
- [ ] 📊 Painel de auditoria (log de alterações).  
- [ ] ➗ Cálculo automático da nota final (expressões).  
- [ ] ✏️ Coluna de notas finais ajustadas (arredondamento/ajuste manual).  
- [ ] 📤 Exportação de notas (CSV/JSON).  


---

## 📌 Organização e Controle
- **Commits:** feitos em branches de funcionalidade (`feature/...`).  
- **Integração:** merge para `dev` após revisão.  
- **Entrega final:** `main` com tag `1.0.0-final`.  
- **Gestão de tarefas:** GitHub Projects (To Do / In Progress / Review / Done).  

---

## 📅 Status Atual
- ✅ Repositório criado no GitHub  
- ⬜ Modelagem do banco de dados (DER)  
- ⬜ Protótipo inicial no Figma  
- ⬜ Implementação backend  
- ⬜ Implementação frontend  
- ⬜ Integração completa  
- ⬜ Versão final para banca  
