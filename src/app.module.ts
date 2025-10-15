// Autor: Rafael Gaudencio Dias
//Descrição: Módulo raiz da aplicação. Responsável por configurar os controladores (API e páginas web),
//registrar os provedores principais e habilitar o serviço de arquivos estáticos (public/).

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PagesController } from './pages.controller';

//import { User } from './users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';


import { AuthModule } from './auth/auth.module';


const isDev = process.env.NODE_ENV !== 'production';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} is required`);
  return v;
}

const connectString =
  process.env.ORACLE_CONNECT_STRING ??
  `${requireEnv('ORACLE_HOST')}:${process.env.ORACLE_PORT ?? 1521}/${requireEnv('ORACLE_SERVICE')}`;
  
@Module({
  imports: [
//Mudanças, usando o TypeOrmModule
  TypeOrmModule.forRoot({
  type: 'oracle',
  username: process.env.ORACLE_USER!,
  password: process.env.ORACLE_PASSWORD!,
  connectString,
  autoLoadEntities: true,    
  synchronize: isDev,           
  logging: isDev ? ['error','schema', 'warn'] : ['error'],
}),
UsersModule,

    ServeStaticModule.forRoot({
      //process.cwd() - pasta raiz do projeto
      //rootPath - tudo que estiver em 'public/...' pode ser acessado via HTTP
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }), 
  AuthModule
  ],
  //AppController controla as rotas da API
  //PagesContoller ela envia as páginas WEB
  controllers: [AppController, PagesController],
  providers: [AppService],
})
export class AppModule {}
//declara o modulo raiz do projeto