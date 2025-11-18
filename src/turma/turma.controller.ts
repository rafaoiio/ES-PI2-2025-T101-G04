// RAFAEL
/**
 * Controller responsável pelas operações CRUD de Turmas.
 *
 * Endpoints disponíveis:
 * - GET /turmas - Lista todas as turmas (opcionalmente filtradas por disciplina)
 * - GET /turmas/:id - Busca uma turma por ID
 * - GET /turmas/:id/overview - Retorna visão geral da turma com contadores
 * - GET /turmas/:id/componentes - Lista componentes com pendências
 * - POST /turmas - Cria uma nova turma
 * - PATCH /turmas/:id - Atualiza uma turma existente
 * - DELETE /turmas/:id - Remove uma turma
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TurmaService } from './turma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

@Controller('turmas')
@UseGuards(AuthGuard('jwt'))
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

  @Get()
  async findAll(@Request() req, @Query('disciplinaId') disciplinaId?: string) {
    try {
      const idProfessorRaw = req.user?.userId;
      console.log(
        '[Turma Controller] findAll chamado - idProfessor recebido (raw):',
        idProfessorRaw,
      );
      console.log('[Turma Controller] Tipo:', typeof idProfessorRaw);
      console.log(
        '[Turma Controller] req.user completo:',
        JSON.stringify(req.user, null, 2),
      );

      if (!idProfessorRaw) {
        console.error(
          '[Turma Controller] idProfessor não encontrado em req.user',
        );
        throw new HttpException(
          'Usuário não autenticado',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Converte para número explicitamente
      const idProfessor =
        typeof idProfessorRaw === 'string'
          ? parseInt(idProfessorRaw, 10)
          : Number(idProfessorRaw);
      console.log('[Turma Controller] idProfessor convertido:', idProfessor);

      if (isNaN(idProfessor)) {
        console.error(
          '[Turma Controller] idProfessor não é um número válido:',
          idProfessorRaw,
        );
        throw new HttpException(
          'ID de professor inválido',
          HttpStatus.BAD_REQUEST,
        );
      }

      const id = disciplinaId ? parseInt(disciplinaId, 10) : undefined;
      console.log(
        '[Turma Controller] Buscando turmas com idProfessor:',
        idProfessor,
        'disciplinaId:',
        id,
      );

      const turmas = await this.turmaService.findAll(idProfessor, id);
      console.log('[Turma Controller] Turmas encontradas:', turmas.length);

      return turmas;
    } catch (error) {
      console.error('[Turma Controller] Erro ao buscar turmas:', error);
      throw new HttpException(
        {
          message: 'Erro ao buscar turmas',
          error: error.message || 'Erro desconhecido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint GET para página de confirmação (redireciona para HTML).
   * O POST abaixo é chamado pelo JavaScript da página.
   * IMPORTANTE: Esta rota deve vir antes de @Get(':id') para evitar conflito de roteamento.
   */
  @Get('confirm-delete/:token')
  getConfirmDeletePage(@Param('token') token: string) {
    // Retorna apenas o token para o frontend processar
    return { token, message: 'Use o endpoint POST para confirmar' };
  }

  @Get(':id/overview')
  getOverview(@Param('id', ParseIntPipe) id: number) {
    return this.turmaService.getOverview(id);
  }

  @Get(':id/componentes')
  getComponentes(@Param('id', ParseIntPipe) id: number) {
    return this.turmaService.getComponentes(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.turmaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTurmaDto, @Request() req) {
    const idProfessorRaw = req.user?.userId;
    console.log(
      '[Turma Controller] Criando turma - idProfessor recebido (raw):',
      idProfessorRaw,
    );
    console.log('[Turma Controller] Tipo:', typeof idProfessorRaw);
    console.log(
      '[Turma Controller] req.user completo:',
      JSON.stringify(req.user, null, 2),
    );

    if (!idProfessorRaw) {
      console.error(
        '[Turma Controller] idProfessor não encontrado em req.user',
      );
      throw new HttpException(
        'Usuário não autenticado',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Converte para número explicitamente
    const idProfessor =
      typeof idProfessorRaw === 'string'
        ? parseInt(idProfessorRaw, 10)
        : Number(idProfessorRaw);
    console.log('[Turma Controller] idProfessor convertido:', idProfessor);

    if (isNaN(idProfessor)) {
      console.error(
        '[Turma Controller] idProfessor não é um número válido:',
        idProfessorRaw,
      );
      throw new HttpException(
        'ID de professor inválido',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(
      '[Turma Controller] Criando turma com idProfessor:',
      idProfessor,
    );
    return this.turmaService.create(dto, idProfessor);
  }

  /**
   * Endpoint para confirmar exclusão de turma via token.
   */
  @Post('confirm-delete/:token')
  confirmDelete(@Param('token') token: string) {
    return this.turmaService.confirmDelete(token);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTurmaDto,
    @Request() req,
  ) {
    // Garante que apenas o dono da turma pode atualizá-la
    const idProfessor = req.user?.userId;
    console.log(
      '[Turma Controller] Atualizando turma - idProfessor:',
      idProfessor,
    );

    // Converte para número explicitamente
    const idProfessorNum =
      typeof idProfessor === 'string'
        ? parseInt(idProfessor, 10)
        : Number(idProfessor);

    return this.turmaService.update(id, dto, idProfessorNum);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const idProfessor = req.user.userId;
    return this.turmaService.remove(id, idProfessor);
  }
}
