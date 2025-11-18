// VITOR
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Controller('matriculas')
@UseGuards(AuthGuard('jwt'))
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Get('turmas/:turmaId')
  async findByTurma(@Param('turmaId', ParseIntPipe) turmaId: number) {
    try {
      return await this.matriculaService.findByTurma(turmaId);
    } catch (error) {
      console.error(`Erro no controller ao buscar matrículas da turma ${turmaId}:`, error);
      throw error;
    }
  }

  @Post()
  async create(@Body() dto: CreateMatriculaDto) {
    try {
      return await this.matriculaService.create(dto);
    } catch (error) {
      console.error('Erro no controller ao criar matrícula:', error);
      console.error('Payload recebido:', dto);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.matriculaService.remove(id);
  }

  @Delete('bulk')
  removeMultiple(@Body() body: { ids: number[] }) {
    return this.matriculaService.removeMultiple(body.ids);
  }
}
