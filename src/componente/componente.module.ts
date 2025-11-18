// LUCAS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponenteController } from './componente.controller';
import { ComponenteService } from './componente.service';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComponenteNota, Nota])],
  controllers: [ComponenteController],
  providers: [ComponenteService],
  exports: [ComponenteService],
})
export class ComponenteModule {}
