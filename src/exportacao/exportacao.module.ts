// VITOR
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportacaoController } from './exportacao.controller';
import { ExportacaoService } from './exportacao.service';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';
import { NotasFinaisModule } from '../notas-finais/notas-finais.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina,
      Turma,
      Matricula,
      ComponenteNota,
      Nota,
    ]),
    NotasFinaisModule,
  ],
  controllers: [ExportacaoController],
  providers: [ExportacaoService],
  exports: [ExportacaoService],
})
export class ExportacaoModule {}
