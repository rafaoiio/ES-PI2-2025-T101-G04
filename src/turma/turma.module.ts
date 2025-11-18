// RAFAEL
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmaController } from './turma.controller';
import { TurmaService } from './turma.service';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';
import { TurmaDeleteRequest } from '../entities/turma-delete-request.entity';
import { Professor } from '../entities/professor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Turma,
      Matricula,
      ComponenteNota,
      Nota,
      TurmaDeleteRequest,
      Professor,
    ]),
  ],
  controllers: [TurmaController],
  providers: [TurmaService],
  exports: [TurmaService],
})
export class TurmaModule {}
