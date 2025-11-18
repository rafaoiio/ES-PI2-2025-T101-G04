# NotaDez – Sistema de Gestão Acadêmica

## Sobre o Projeto

O **NotaDez** é um sistema web completo desenvolvido como parte do **Projeto Integrador 2 (PI2)** do curso de **Engenharia de Software** da **Pontifícia Universidade Católica de Campinas (PUC-Campinas)**, turma T101-G04, no ano de 2025.

O sistema oferece uma plataforma moderna e segura para gestão acadêmica, permitindo aos docentes o controle completo do processo avaliativo através de funcionalidades como cadastro de instituições, cursos, disciplinas e turmas; importação e exportação de dados; lançamento e cálculo automático de notas; e auditoria completa de alterações.

## Objetivo

Automatizar e facilitar a gestão acadêmica através de um sistema integrado que permite gestão completa de instituições, cursos, disciplinas e turmas; importação e exportação de alunos via CSV/JSON; criação e configuração de componentes de avaliação; lançamento de notas com validação automática; cálculo automático de notas finais (média simples ou ponderada); ajuste manual de notas finais; sistema de auditoria para rastreamento de alterações; e dashboard com métricas e estatísticas em tempo real.

## Contexto Acadêmico

Este projeto é desenvolvido como requisito obrigatório do **Projeto Integrador 2**, disciplina do curso de Engenharia de Software da PUC-Campinas, que visa integrar conhecimentos adquiridos ao longo do curso através do desenvolvimento de um sistema completo, desde a modelagem até a implementação e testes.

## Tecnologias Utilizadas

### Backend

- **Node.js** (LTS) com **TypeScript 5.7.3**
- **NestJS 11.1.6** - Framework Node.js progressivo
- **TypeORM 0.3.27** - ORM para gerenciamento de banco de dados
- **Oracle Database** - Sistema de gerenciamento de banco de dados relacional
- **Passport.js** - Autenticação com estratégias JWT e Local
- **class-validator** e **class-transformer** - Validação e transformação de dados
- **bcrypt** - Criptografia de senhas
- **Multer** - Upload de arquivos

### Frontend

- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **Bootstrap 5** - Framework CSS responsivo
- Design System customizado baseado em protótipo Figma

### Ferramentas de Desenvolvimento

- **Git** + **GitHub** - Controle de versão e gestão de tarefas (Kanban)
- **ESLint** + **Prettier** - Padronização de código
- **Jest** - Framework de testes

## Estrutura do Projeto

```text
/src          → Backend NestJS (aluno, auth, auditoria, componente, curso, dashboard,
                disciplina, entities, exportacao, instituicao, lancamento, matricula,
                notas-finais, turma, users)
/public       → Frontend estático (HTML, CSS, JavaScript)
/banco.sql    → Scripts SQL e modelos de banco de dados
```

## Pré-requisitos

- **Node.js** v18 ou superior
- **Oracle Database** (XE ou superior)
- **npm** ou **yarn**
- **Git**

## Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU-GRUPO/ES-PI2-2025-T101-G04.git
cd ES-PI2-2025-T101-G04
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XE
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES=1d
NODE_ENV=development
PORT=3000
```

### 4. Configurar o banco de dados

Execute os scripts SQL em `banco.sql/` (`Codigos SQLs.sql` e `trigger_auditoria_nota.sql`).

### 5. Executar o servidor

```bash
npm run start:dev
```

O sistema estará disponível em `http://localhost:3000`

## Funcionalidades Principais

- **Autenticação**: Login com JWT, recuperação de senha, controle de sessão
- **Gestão Acadêmica**: CRUD completo de instituições, cursos, disciplinas, turmas e alunos
- **Importação/Exportação**: Suporte a CSV e JSON para alunos e resultados
- **Componentes de Avaliação**: Criação e configuração de componentes com pesos e tipos
- **Lançamento de Notas**: Interface em grid com validação (0.00 a 10.00)
- **Cálculo Automático**: Média simples ou ponderada conforme configuração
- **Ajuste Manual**: Permissão para ajuste de notas finais com justificativa
- **Auditoria**: Rastreamento automático de todas as alterações em notas
- **Dashboard**: Métricas e estatísticas em tempo real do sistema

## Regras de Negócio

- Notas devem estar entre 0.00 e 10.00 (duas casas decimais)
- Sigla de componente deve ser única por disciplina
- Nota final permanece `null` se faltar nota obrigatória
- Exportação bloqueada quando há pendências de lançamento
- Todas as alterações de notas são registradas automaticamente na auditoria

## Status do Projeto

| Etapa | Status |
|-------|--------|
| Repositório e Versionamento | ✅ Concluído |
| Modelagem do Banco de Dados (DER) | ✅ Concluído |
| Protótipo no Figma | ✅ Concluído |
| Backend (NestJS + TypeORM) | ✅ Implementado |
| Frontend (HTML/CSS/JavaScript) | ✅ Implementado |
| Integração Backend/Frontend | ✅ Em andamento |
| Testes Automatizados | 🔄 Em desenvolvimento |
| Documentação Final | 🔄 Em andamento |
| Versão para Apresentação | ⏳ Aguardando |

## Equipe de Desenvolvimento

| Nome | Função |
|------|--------|
| **Laura Cristine Soares** | Engenharia de Software |
| **Lucas David de Souza** | Engenharia de Software |
| **Pedro Henrique Medeiros dos Reis** | Engenharia de Software |
| **Rafael Gaudencio Dias** | Engenharia de Software |
| **Vitor Hugo Gilbert** | Engenharia de Software |

## Organização do Desenvolvimento

Versionamento em branches `feature/...` com merge na `dev`, gestão de tarefas via GitHub Projects (Kanban), padrões de código com ESLint e Prettier, e cabeçalhos de arquivo conforme normas do PI2.

## Licença

Este projeto é desenvolvido exclusivamente para fins acadêmicos como parte do Projeto Integrador 2 (PI2) do curso de Engenharia de Software da PUC-Campinas. UNLICENSED
