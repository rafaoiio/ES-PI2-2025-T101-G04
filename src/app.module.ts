// Autor: Rafael Gaudencio Dias
//Descrição: 
// Observação: requer instalação dos pacotes 'npm i @nestjs/serve-static'
// Data: 07/10/2025 : 00:30

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PagesController } from './pages.controller';



@Module({
  imports: [
    ServeStaticModule.forRoot({
      //process.cwd() - pasta raiz do projeto
      //rootPath - tudo que estiver em 'public/...' pode ser acessado via HTTP
      rootPath: join(process.cwd(), 'public'),
    }),  
  ],
  //AppController controla as rotas da API
  //PagesContoller ela envia as páginas WEB
  controllers: [AppController, PagesController],
  providers: [AppService],
})
export class AppModule {}
//declara o modulo raiz do projeto