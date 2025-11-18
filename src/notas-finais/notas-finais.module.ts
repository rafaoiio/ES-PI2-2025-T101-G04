// VITOR
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasFinaisController } from './notas-finais.controller';
import { NotasFinaisService } from './notas-finais.service';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina,
      Turma,
      Matricula,
      ComponenteNota,
      Nota,
    ]),
  ],
  controllers: [NotasFinaisController],
  providers: [NotasFinaisService],
  exports: [NotasFinaisService],
})
export class NotasFinaisModule {}
