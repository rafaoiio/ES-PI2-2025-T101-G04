// LAURA
// Autor: Rafael Gaudencio Dias
// Descrição: Controller das Páginas WEB
// Observação: requer instalação dos pacotes "express" e "@types/express" para uso do decorador @Res()
// Data: 07/10/2025 : 00:30

import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller() // Lugar onde vai ficar as **Rotas** de cada página WEB;
export class PagesController {
  // crio uma classe PagesController, guardo as funções ( métodos), cada um é uma requisição;
  //O GET responde quando alguém faz alguma requisição, nesse em específico está vazio pois corresponde a "/", "localhost:3000";
  @Get()
  // O RES é a resposta que eu vou dar quando alguém fizer uma requisição, ele vem do Express
  home(@Res() res: Response) {
    // Redireciona para a tela de login
    return res.sendFile(join(process.cwd(), 'public', 'html', 'login.html'));
  }

  @Get('favicon.ico')
  favicon(@Res() res: Response) {
    // Retorna 204 No Content quando não há favicon
    return res.status(204).end();
  }

  @Get('index.html')
  index(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    return res.sendFile(join(process.cwd(), 'public', 'html', 'index.html'));
  }

  @Get('cadastro')
  cadastro(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'cadastro.html'));
  }

  @Get('esqueci')
  esqueci(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'esqueci.html'));
  }

  @Get('dashboard.html')
  dashboard(@Res() res: Response) {
    // Redireciona dashboard.html para index.html (padronização)
    return res.redirect(301, '/index.html');
  }

  @Get('instituicoes.html')
  instituicoes(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'instituicoes.html'),
    );
  }

  @Get('cursos.html')
  cursos(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'cursos.html'));
  }

  @Get('disciplinas.html')
  disciplinas(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'disciplinas.html'),
    );
  }

  @Get('componentes.html')
  componentes(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'componentes.html'),
    );
  }

  @Get('turmas.html')
  turmas(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    return res.sendFile(join(process.cwd(), 'public', 'html', 'turmas.html'));
  }

  @Get('alunos.html')
  alunos(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    return res.sendFile(join(process.cwd(), 'public', 'html', 'alunos.html'));
  }

  @Get('perfil.html')
  perfil(@Res() res: Response) {
    // A verificação de autenticação é feita no frontend (auth-check.js)
    console.log('✅ PagesController: perfil.html route called');
    const filePath = join(process.cwd(), 'public', 'html', 'perfil.html');
    console.log('📁 Serving perfil.html from:', filePath);
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('❌ Error serving perfil.html:', err);
        res
          .status(500)
          .json({ error: 'Erro ao servir arquivo', message: err.message });
      } else {
        console.log('✅ perfil.html served successfully');
      }
    });
  }

  @Get('notas.html')
  notas(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'notas.html'));
  }

  @Get('login.html')
  login(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'login.html'));
  }

  @Get('disciplina_form.html')
  disciplinaForm(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'disciplina_form.html'),
    );
  }

  @Get('componente_form.html')
  componenteForm(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'componente_form.html'),
    );
  }

  @Get('turma_form.html')
  turmaForm(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'turma_form.html'),
    );
  }

  @Get('turma_hub.html')
  turmaHub(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'turma_hub.html'),
    );
  }

  @Get('aluno_form.html')
  alunoForm(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'aluno_form.html'),
    );
  }

  @Get('lancar_notas_select.html')
  lancarNotasSelect(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'lancar_notas_select.html'),
    );
  }

  @Get('lancar_notas_grid.html')
  lancarNotasGrid(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'lancar_notas_grid.html'),
    );
  }

  @Get('notas_finais.html')
  notasFinais(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'notas_finais.html'),
    );
  }

  @Get('exportar.html')
  exportar(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'html', 'exportar.html'));
  }

  @Get('primeiro-acesso.html')
  primeiroAcesso(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'public', 'html', 'primeiro-acesso.html'),
    );
  }

  @Get('confirmar-exclusao-turma')
  confirmarExclusaoTurma(@Res() res: Response) {
    return res.sendFile(
      join(
        process.cwd(),
        'public',
        'html',
        'confirmar-exclusao-turma.html',
      ),
    );
  }
}
