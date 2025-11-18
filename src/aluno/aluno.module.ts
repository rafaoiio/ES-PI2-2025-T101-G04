// RAFAEL
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlunoController } from './aluno.controller';
import { AlunoService } from './aluno.service';
import { Aluno } from '../entities/aluno.entity';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno, Turma, Matricula])],
  controllers: [AlunoController],
  providers: [AlunoService],
  exports: [AlunoService],
})
export class AlunoModule {}
