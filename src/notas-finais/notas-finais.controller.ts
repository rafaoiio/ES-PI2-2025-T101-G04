// VITOR
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotasFinaisService } from './notas-finais.service';

@Controller('notas-finais')
@UseGuards(AuthGuard('jwt'))
export class NotasFinaisController {
  constructor(private readonly notasFinaisService: NotasFinaisService) {}

  @Get(':discId/:turmaId')
  calcularNotasFinais(
    @Param('discId', ParseIntPipe) discId: number,
    @Param('turmaId', ParseIntPipe) turmaId: number,
    @Request() req,
  ) {
    const idProfessor = req.user?.userId;
    return this.notasFinaisService.calcularNotasFinais(
      discId,
      turmaId,
      idProfessor,
    );
  }

  /**
   * Habilita ou desabilita Notas Finais Ajustadas para uma disciplina.
   */
  @Post('toggle-ajustada/:discId')
  toggleNotaAjustada(
    @Param('discId', ParseIntPipe) discId: number,
    @Body() body: { habilitar: boolean },
  ) {
    return this.notasFinaisService.toggleNotaAjustada(discId, body.habilitar);
  }

  /**
   * Atualiza Nota Final Ajustada manualmente.
   */
  @Patch('ajustada/:matriculaId')
  updateNotaAjustada(
    @Param('matriculaId', ParseIntPipe) matriculaId: number,
    @Body() body: { notaAjustada: number },
    @Request() req,
  ) {
    const idProfessor = req.user?.userId;
    return this.notasFinaisService.updateNotaAjustada(
      matriculaId,
      body.notaAjustada,
      idProfessor,
    );
  }
}
