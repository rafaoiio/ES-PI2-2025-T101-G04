// PEDRO
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LancamentoService } from './lancamento.service';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

@Controller('lancamentos')
@UseGuards(AuthGuard('jwt'))
export class LancamentoController {
  constructor(private readonly lancamentoService: LancamentoService) {}

  /**
   * Retorna grid em modo somente leitura por padrão.
   * Use ?readonly=false para permitir edição.
   */
  @Get(':turmaId/:componenteId')
  getGrid(
    @Param('turmaId', ParseIntPipe) turmaId: number,
    @Param('componenteId', ParseIntPipe) componenteId: number,
    @Request() req,
    @Query('readonly') readonly?: string,
  ) {
    const isReadonly = readonly !== 'false'; // Padrão é true (somente leitura)
    const idProfessor = req.user?.userId;
    return this.lancamentoService.getGrid(
      turmaId,
      componenteId,
      isReadonly,
      idProfessor,
    );
  }

  @Patch(':matriculaId/:componenteId')
  updateNota(
    @Param('matriculaId', ParseIntPipe) matriculaId: number,
    @Param('componenteId', ParseIntPipe) componenteId: number,
    @Body() dto: UpdateLancamentoDto,
    @Request() req,
  ) {
    const idProfessor = req.user.userId;
    return this.lancamentoService.updateNota(
      matriculaId,
      componenteId,
      dto,
      idProfessor,
    );
  }

  /**
   * Modo de Edição Completa: atualiza múltiplas notas de diferentes componentes.
   */
  @Post('bulk-update')
  bulkUpdate(
    @Body()
    body: {
      updates: Array<{
        matriculaId: number;
        componenteId: number;
        valor: number;
      }>;
    },
    @Request() req,
  ) {
    const idProfessor = req.user.userId;
    return this.lancamentoService.bulkUpdate(body.updates, idProfessor);
  }
}
