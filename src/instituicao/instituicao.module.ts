// LUCAS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituicaoController } from './instituicao.controller';
import { InstituicaoService } from './instituicao.service';
import { Instituicao } from '../entities/instituicao.entity';
import { Curso } from '../entities/curso.entity';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Instituicao, Curso, Disciplina, Turma])],
  controllers: [InstituicaoController],
  providers: [InstituicaoService],
  exports: [InstituicaoService],
})
export class InstituicaoModule {}
