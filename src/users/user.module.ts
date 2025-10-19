//Autor Rafael Gaudencio Dias
//Descrição: Módulo que reúne tudo do usuário — entidade, serviço e rotas — e disponibiliza essas funções para o restante do sistema.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './user.entity';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Professor])],
  //conecto ao TypeOrm dizendo que vou usar a entidade User no banco de dados
  providers: [UsersService],
  // O UserService contém a lógica dos usuários
  controllers: [UsersController],
  // Define as rotas de /users
  exports: [UsersService]
  //permito que outros módulos usem o UserService
})
export class UsersModule {}
