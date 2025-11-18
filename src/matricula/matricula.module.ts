// VITOR
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatriculaController } from './matricula.controller';
import { MatriculaService } from './matricula.service';
import { Matricula } from '../entities/matricula.entity';
import { Aluno } from '../entities/aluno.entity';
import { Turma } from '../entities/turma.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Matricula, Aluno, Turma])],
  controllers: [MatriculaController],
  providers: [MatriculaService],
  exports: [MatriculaService],
})
export class MatriculaModule {}
