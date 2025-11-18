// PEDRO
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LancamentoController } from './lancamento.controller';
import { LancamentoService } from './lancamento.service';
import { Nota } from '../entities/nota.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nota, Matricula, ComponenteNota])],
  controllers: [LancamentoController],
  providers: [LancamentoService],
  exports: [LancamentoService],
})
export class LancamentoModule {}
