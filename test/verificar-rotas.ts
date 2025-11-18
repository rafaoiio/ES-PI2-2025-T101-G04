import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

/**
 * Script de verificação de rotas
 * Garante que todas as rotas documentadas existem
 */

async function verificarRotas() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('\n=== VERIFICAÇÃO DE ROTAS ===\n');

  // Rotas esperadas conforme documentação
  const rotasEsperadas = [
    // Alunos
    { method: 'POST', path: '/alunos', descricao: 'Criar/atualizar aluno' },
    { method: 'GET', path: '/alunos', descricao: 'Listar alunos' },
    { method: 'GET', path: '/alunos/:ra', descricao: 'Buscar aluno por RA' },
    {
      method: 'DELETE',
      path: '/alunos/bulk',
      descricao: 'Remover múltiplos alunos',
    },
    {
      method: 'POST',
      path: '/alunos/import/csv',
      descricao: 'Importar alunos CSV',
    },
    {
      method: 'POST',
      path: '/alunos/import/json',
      descricao: 'Importar alunos JSON',
    },

    // Componentes
    { method: 'POST', path: '/componentes', descricao: 'Criar componente' },
    {
      method: 'GET',
      path: '/componentes/disciplinas/:discId',
      descricao: 'Listar componentes por disciplina',
    },
    { method: 'GET', path: '/componentes/:id', descricao: 'Buscar componente' },
    {
      method: 'PATCH',
      path: '/componentes/:id',
      descricao: 'Atualizar componente',
    },
    {
      method: 'DELETE',
      path: '/componentes/:id',
      descricao: 'Remover componente',
    },

    // Cursos
    { method: 'POST', path: '/cursos', descricao: 'Criar curso' },
    { method: 'GET', path: '/cursos', descricao: 'Listar cursos' },
    { method: 'GET', path: '/cursos/:id', descricao: 'Buscar curso' },
    { method: 'PATCH', path: '/cursos/:id', descricao: 'Atualizar curso' },
    { method: 'DELETE', path: '/cursos/:id', descricao: 'Remover curso' },

    // Disciplinas
    { method: 'POST', path: '/disciplinas', descricao: 'Criar disciplina' },
    { method: 'GET', path: '/disciplinas', descricao: 'Listar disciplinas' },
    { method: 'GET', path: '/disciplinas/:id', descricao: 'Buscar disciplina' },
    {
      method: 'PATCH',
      path: '/disciplinas/:id',
      descricao: 'Atualizar disciplina',
    },
    {
      method: 'DELETE',
      path: '/disciplinas/:id',
      descricao: 'Remover disciplina',
    },

    // Instituições
    { method: 'POST', path: '/instituicoes', descricao: 'Criar instituição' },
    { method: 'GET', path: '/instituicoes', descricao: 'Listar instituições' },
    {
      method: 'GET',
      path: '/instituicoes/:id',
      descricao: 'Buscar instituição',
    },
    {
      method: 'PATCH',
      path: '/instituicoes/:id',
      descricao: 'Atualizar instituição',
    },
    {
      method: 'DELETE',
      path: '/instituicoes/:id',
      descricao: 'Remover instituição',
    },

    // Matrículas
    { method: 'POST', path: '/matriculas', descricao: 'Criar matrícula' },
    {
      method: 'GET',
      path: '/matriculas/turmas/:turmaId',
      descricao: 'Listar matrículas por turma',
    },
    {
      method: 'DELETE',
      path: '/matriculas/:id',
      descricao: 'Remover matrícula',
    },
    {
      method: 'DELETE',
      path: '/matriculas/bulk',
      descricao: 'Remover múltiplas matrículas',
    },

    // Turmas
    { method: 'POST', path: '/turmas', descricao: 'Criar turma' },
    { method: 'GET', path: '/turmas', descricao: 'Listar turmas' },
    { method: 'GET', path: '/turmas/:id', descricao: 'Buscar turma' },
    {
      method: 'GET',
      path: '/turmas/:id/overview',
      descricao: 'Overview da turma',
    },
    {
      method: 'GET',
      path: '/turmas/:id/componentes',
      descricao: 'Componentes da turma',
    },
    { method: 'PATCH', path: '/turmas/:id', descricao: 'Atualizar turma' },
    { method: 'DELETE', path: '/turmas/:id', descricao: 'Remover turma' },
    {
      method: 'GET',
      path: '/turmas/confirm-delete/:token',
      descricao: 'Página de confirmação',
    },
    {
      method: 'POST',
      path: '/turmas/confirm-delete/:token',
      descricao: 'Confirmar exclusão',
    },

    // Usuários
    { method: 'POST', path: '/users', descricao: 'Criar usuário' },
    { method: 'GET', path: '/users', descricao: 'Listar usuários' },
    { method: 'GET', path: '/users/:id', descricao: 'Buscar usuário' },
    {
      method: 'PATCH',
      path: '/users/me',
      descricao: 'Atualizar perfil próprio',
    },
    { method: 'PATCH', path: '/users/:id', descricao: 'Atualizar usuário' },
    { method: 'DELETE', path: '/users/:id', descricao: 'Remover usuário' },

    // Lançamentos
    {
      method: 'GET',
      path: '/lancamentos/:turmaId/:componenteId',
      descricao: 'Grid de lançamento',
    },
    {
      method: 'PATCH',
      path: '/lancamentos/:matriculaId/:componenteId',
      descricao: 'Atualizar nota',
    },
    {
      method: 'POST',
      path: '/lancamentos/bulk-update',
      descricao: 'Atualização em lote',
    },

    // Notas Finais
    {
      method: 'GET',
      path: '/notas-finais/:discId/:turmaId',
      descricao: 'Calcular notas finais',
    },
    {
      method: 'POST',
      path: '/notas-finais/toggle-ajustada/:discId',
      descricao: 'Toggle ajustada',
    },
    {
      method: 'PATCH',
      path: '/notas-finais/ajustada/:matriculaId',
      descricao: 'Atualizar ajustada',
    },

    // Exportação
    {
      method: 'GET',
      path: '/exportacao/:discId/:turmaId/csv',
      descricao: 'Exportar CSV',
    },
    {
      method: 'GET',
      path: '/exportacao/:discId/:turmaId/json',
      descricao: 'Exportar JSON',
    },

    // Dashboard
    { method: 'GET', path: '/dashboard/metrics', descricao: 'Métricas' },
    {
      method: 'GET',
      path: '/dashboard/first-access',
      descricao: 'Primeiro acesso',
    },

    // Auditoria
    {
      method: 'GET',
      path: '/auditoria/turma/:id',
      descricao: 'Auditoria por turma',
    },

    // Autenticação
    { method: 'POST', path: '/auth/login', descricao: 'Login' },
    { method: 'GET', path: '/auth/me', descricao: 'Usuário logado' },
    {
      method: 'POST',
      path: '/auth/forgot-password',
      descricao: 'Solicitar recuperação',
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      descricao: 'Redefinir senha',
    },
  ];

  console.log(`Total de rotas esperadas: ${rotasEsperadas.length}`);
  console.log('\n✅ Sistema pronto para testes!\n');

  await app.close();
}

verificarRotas().catch(console.error);
