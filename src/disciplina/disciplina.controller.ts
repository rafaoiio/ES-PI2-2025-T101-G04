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
} from '@nestjs/common';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';

@Controller('disciplinas')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  @Get()
  findAll() {
    return this.disciplinaService.findAll();
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