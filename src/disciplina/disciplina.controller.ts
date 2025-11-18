// LUCAS
/**
 * Controller responsável pelas operações CRUD de Disciplinas.
 *
 * Endpoints disponíveis:
 * - GET /disciplinas - Lista todas as disciplinas
 * - GET /disciplinas/:id - Busca uma disciplina por ID
 * - POST /disciplinas - Cria uma nova disciplina
 * - PATCH /disciplinas/:id - Atualiza uma disciplina existente
 * - DELETE /disciplinas/:id - Remove uma disciplina
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';

@Controller('disciplinas')
@UseGuards(AuthGuard('jwt'))
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Get()
  async findAll(@Request() req) {
    try {
      const idProfessorRaw = req.user?.userId;
      console.log('[Disciplina Controller] findAll chamado - idProfessor recebido (raw):', idProfessorRaw);
      
      // Converte para número explicitamente
      const idProfessor = idProfessorRaw ? (typeof idProfessorRaw === 'string' ? parseInt(idProfessorRaw, 10) : Number(idProfessorRaw)) : undefined;
      
      // Disciplinas são globais - passamos idProfessor apenas para logs, mas retornamos todas
      const disciplinas = await this.disciplinaService.findAll(idProfessor);
      console.log('[Disciplina Controller] Total de disciplinas retornadas:', disciplinas.length);
      
      return disciplinas;
    } catch (error) {
      console.error('[Disciplina Controller] Erro ao buscar disciplinas:', error);
      throw new HttpException(
        {
          message: 'Erro ao buscar disciplinas',
          error: error.message || 'Erro desconhecido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDisciplinaDto) {
    return this.disciplinaService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDisciplinaDto,
  ) {
    return this.disciplinaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.disciplinaService.remove(id);
  }
}
