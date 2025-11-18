// PEDRO
/**
 * Controller responsável pela auditoria de notas.
 * Endpoints para consultar auditoria.
 */
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(AuthGuard('jwt'))
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * Retorna auditoria de uma turma ordenada por data/hora decrescente.
   */
  @Get('turma/:id')
  getAuditoriaPorTurma(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.getAuditoriaPorTurma(id);
  }
}
