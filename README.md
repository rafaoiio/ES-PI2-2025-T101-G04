# NotaDez - Sistema de Gestão de Notas

Sistema completo de gestão de notas acadêmicas com frontend HTML+Bootstrap+TypeScript e backend NestJS+TypeORM+Oracle.

## Estrutura do Projeto

### Backend (NestJS + TypeORM + Oracle)
- **Módulos implementados:**
  - `auth` - Autenticação (mock retornando token fake)
  - `dashboard` - Métricas e estatísticas
  - `disciplina` - Gerenciamento de disciplinas
  - `componente` - Componentes de nota (P1, P2, etc.)
  - `turma` - Gerenciamento de turmas
  - `aluno` - Gerenciamento de alunos
  - `matricula` - Matrículas de alunos em turmas
  - `lancamento` - Lançamento de notas
  - `notas-finais` - Cálculo de notas finais (SIMPLES e PONDERADA)
  - `exportacao` - Exportação de notas em CSV

### Frontend (HTML + Bootstrap + JavaScript)
- **Páginas implementadas:**
  - `index.html` - Dashboard principal
  - `login.html` - Login
  - `disciplinas.html` - Listagem de disciplinas
  - `disciplina_form.html` - Formulário de disciplina
  - `componentes.html` - Listagem de componentes
  - `componente_form.html` - Formulário de componente
  - `turmas.html` - Listagem de turmas
  - `turma_form.html` - Formulário de turma
  - Utilitários: `env.js`, `api.js`, `utils.js`

## Configuração e Execução

### Pré-requisitos
- Node.js (v18+)
- Oracle Database
- npm ou yarn

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE=XE
# OU use ORACLE_CONNECT_STRING diretamente:
# ORACLE_CONNECT_STRING=localhost:1521/XE

JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES=1d
NODE_ENV=development
```

### Instalação

```bash
npm install
```

### Executar o Banco de Dados
Execute os scripts SQL em `banco.sql/Codigos SQLs.sql` para criar as tabelas.

Execute também o script da trigger de auditoria:
```bash
# No Oracle SQL Developer ou similar
@banco.sql/trigger_auditoria_nota.sql
```

### Executar o Backend

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

O backend estará disponível em `http://localhost:3000`

### Acessar o Frontend
Abra `http://localhost:3000` no navegador.

## Funcionalidades Implementadas

### 1. Autenticação
- Login mock retornando token fake
- Token salvo no localStorage

### 2. Dashboard
- Métricas: contadores de disciplinas, turmas, componentes e alunos
- Atalhos rápidos

### 3. Disciplinas
- Listagem de disciplinas
- Criação/edição de disciplinas
- Configuração de regra de cálculo (SIMPLES ou PONDERADA)
- Suporte a pesos JSON para cálculo ponderado

### 4. Componentes de Nota
- Listagem por disciplina
- Criação/edição de componentes
- Validação de sigla única por disciplina
- Exclusão (bloqueada se houver notas)

### 5. Turmas
- Listagem com filtro por disciplina
- Criação/edição de turmas
- Overview com pendências de notas

### 6. Alunos e Matrículas
- Criação de alunos (upsert por RA)
- Vinculação de alunos a turmas
- Listagem de alunos por turma

### 7. Lançamento de Notas
- Grid de lançamento por componente
- Validação de notas (0.00 a 10.00)
- Formatação com 2 casas decimais

### 8. Notas Finais
- Cálculo SIMPLES (média aritmética)
- Cálculo PONDERADA (com pesos JSON)
- Exibição de notas por componente e nota final

### 9. Exportação CSV
- Exportação de notas finais
- Validação de pendências antes de exportar
- Formato: `YYYY-MM-DD_HHmmss-<TURMA>-<SIGLA>.csv`

### 10. Auditoria
- Trigger Oracle que registra todas as alterações em NOTA
- Gravação automática em AUDITORIA_NOTA

## Endpoints da API

### Auth
- `POST /auth/login` - Login (retorna token mock)

### Dashboard
- `GET /dashboard/metrics` - Métricas do sistema

### Disciplinas
- `GET /disciplinas` - Listar todas
- `GET /disciplinas/:id` - Buscar por ID
- `POST /disciplinas` - Criar
- `PATCH /disciplinas/:id` - Atualizar

### Componentes
- `GET /componentes/disciplinas/:discId` - Listar por disciplina
- `GET /componentes/:id` - Buscar por ID
- `POST /componentes` - Criar
- `PATCH /componentes/:id` - Atualizar
- `DELETE /componentes/:id` - Excluir (409 se houver notas)

### Turmas
- `GET /turmas?disciplinaId?` - Listar (com filtro opcional)
- `GET /turmas/:id` - Buscar por ID
- `GET /turmas/:id/overview` - Overview com pendências
- `GET /turmas/:id/componentes` - Componentes com pendências
- `POST /turmas` - Criar
- `PATCH /turmas/:id` - Atualizar

### Alunos
- `GET /alunos` - Listar todos
- `GET /alunos/:ra` - Buscar por RA
- `POST /alunos` - Criar/atualizar (upsert)

### Matrículas
- `GET /matriculas/turmas/:turmaId` - Listar por turma
- `POST /matriculas` - Criar (409 se já existir)
- `DELETE /matriculas/:id` - Remover

### Lançamentos
- `GET /lancamentos/:turmaId/:componenteId` - Grid de notas
- `PATCH /lancamentos/:matriculaId/:componenteId` - Atualizar nota

### Notas Finais
- `GET /notas-finais/:discId/:turmaId` - Calcular notas finais

### Exportação
- `GET /exportacao/:discId/:turmaId/csv` - Exportar CSV (409 se houver pendências)

## Regras de Negócio

1. **Notas**: Aceitas de 0.00 a 10.00 (duas casas decimais)
2. **Sigla de Componente**: Única por disciplina
3. **Matrícula**: Um aluno não pode estar matriculado duas vezes na mesma turma
4. **Exclusão de Componente**: Bloqueada se houver notas lançadas
5. **Cálculo SIMPLES**: Média aritmética de todos os componentes
6. **Cálculo PONDERADA**: Soma ponderada usando pesos JSON da disciplina
7. **Nota Final**: Null se faltar qualquer nota de qualquer componente
8. **Exportação**: Bloqueada se houver pendências

## Observações

- O sistema não altera nenhuma tabela SQL existente
- A trigger de auditoria deve ser executada manualmente no banco
- O login é mock e sempre retorna sucesso com token fake
- Todas as validações estão implementadas no backend e frontend

## Desenvolvimento

Para desenvolvimento, use:
```bash
npm run start:dev
```

O servidor recarrega automaticamente ao detectar mudanças.

## Licença

UNLICENSED
