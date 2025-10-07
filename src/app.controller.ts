// Autor: Rafael Gaudencio Dias
//Descrição: Controller da API (prefixo /api)
// Observação: requer instalação dos pacotes "express" e "@types/express" para uso do decorador @Res()
// Data: 07/10/2025 : 00:30

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
