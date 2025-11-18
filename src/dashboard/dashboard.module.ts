// VITOR
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Aluno } from '../entities/aluno.entity';
import { Matricula } from '../entities/matricula.entity';
import { Instituicao } from '../entities/instituicao.entity';
import { Curso } from '../entities/curso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina,
      Turma,
      ComponenteNota,
      Aluno,
      Matricula,
      Instituicao,
      Curso,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
