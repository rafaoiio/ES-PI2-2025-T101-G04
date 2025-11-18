// RAFAEL
/**
 * Controller responsável pelas operações CRUD de Alunos.
 *
 * Endpoints disponíveis:
 * - GET /alunos - Lista todos os alunos
 * - GET /alunos/:ra - Busca um aluno por RA
 * - POST /alunos - Cria ou atualiza um aluno
 * - DELETE /alunos/bulk - Remove múltiplos alunos
 * - POST /alunos/import/csv - Importa alunos de CSV
 * - POST /alunos/import/json - Importa alunos de JSON
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Controller('alunos')
@UseGuards(AuthGuard('jwt'))
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Get()
  findAll(@Request() req) {
    const idProfessor = req.user?.userId;
    return this.alunoService.findAll(idProfessor);
  }

  @Get(':ra')
  findOne(@Param('ra', ParseIntPipe) ra: number) {
    return this.alunoService.findOne(ra);
  }

  @Post()
  create(@Body() dto: CreateAlunoDto) {
    return this.alunoService.createOrUpdate(dto);
  }

  /**
   * Remove múltiplos alunos por seus RAs.
   */
  @Delete('bulk')
  removeBulk(@Body() body: { ras: number[] }) {
    return this.alunoService.removeBulk(body.ras);
  }

  /**
   * Importa alunos de arquivo CSV.
   * Formato: 2 primeiras colunas = identificador (RA), nome
   */
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }

    if (!file.buffer) {
      throw new Error('Arquivo inválido ou vazio');
    }

    const csvContent = file.buffer.toString('utf-8');
    return this.alunoService.importFromCSV(csvContent);
  }

  /**
   * Importa alunos de arquivo JSON.
   * Formato: array de objetos com identificador e nome
   */
  @Post('import/json')
  @UseInterceptors(FileInterceptor('file'))
  async importJSON(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }

    if (!file.buffer) {
      throw new Error('Arquivo inválido ou vazio');
    }

    const jsonContent = file.buffer.toString('utf-8');
    return this.alunoService.importFromJSON(jsonContent);
  }
}
