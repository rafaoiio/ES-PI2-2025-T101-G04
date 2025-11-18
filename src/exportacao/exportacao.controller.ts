// VITOR
import { Controller, Get, Param, ParseIntPipe, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ExportacaoService } from './exportacao.service';

@Controller('exportacao')
@UseGuards(AuthGuard('jwt'))
export class ExportacaoController {
  constructor(private readonly exportacaoService: ExportacaoService) {}

  @Get(':discId/:turmaId/csv')
  async exportarCSV(
    @Param('discId', ParseIntPipe) discId: number,
    @Param('turmaId', ParseIntPipe) turmaId: number,
    @Res() res: Response,
    @Request() req,
  ) {
    const idProfessor = req.user?.userId;
    const { csv, filename } = await this.exportacaoService.exportarCSV(
      discId,
      turmaId,
      idProfessor,
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get(':discId/:turmaId/json')
  async exportarJSON(
    @Param('discId', ParseIntPipe) discId: number,
    @Param('turmaId', ParseIntPipe) turmaId: number,
    @Res() res: Response,
    @Request() req,
  ) {
    const idProfessor = req.user?.userId;
    const { json, filename } = await this.exportacaoService.exportarJSON(
      discId,
      turmaId,
      idProfessor,
    );

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(json);
  }
}
