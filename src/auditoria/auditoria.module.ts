// PEDRO
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaNota } from '../entities/auditoria-nota.entity';
import { Nota } from '../entities/nota.entity';
import { Matricula } from '../entities/matricula.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditoriaNota, Nota, Matricula]),
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}

