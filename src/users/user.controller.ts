//Autor Rafael Gaudencio Dias
//Descrição: Controlador das rotas de usuário: lista, busca por id, cria e remove usuários, usando o serviço para acessar o banco com segurança.

import { Controller, Get, Post, Param, Delete, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users') 
// esse arquivo cuida das rotas que começam com /users
export class UsersController {
  constructor(private readonly users: UsersService)
  // recebo o UserService que é quem fala com o banco para usar dentro das rotas
  {}

  @Get()
  findAll(): Promise<Partial<User>[]>
  // vou devolver uma lista de usuários sem dados sensíveis
  {
    return this.users.findAllPublic();
    // peço ao serviço a lista pública e o devolvo
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Partial<User>>
  // pego o id da URL e garanto que é um número
  {
    const user = await this.users.findOnePublic(id);
    // peço ao serviço os dados públicos desse usuário 
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // caso não exista responde um 404  
    return user;
  }

  @Post()
  create(@Body() dto: CreateUserDto)
  // lê os dados do corpo da requisição ( que foi validado pelo DTO )
  {
  return this.users.create(dto); // service faz o hash e salva
  // Peço ao serviço para criar
}

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number)
  // garanto que é um número
  {
    return this.users.remove(id);
    //peço para remover e devolve o resultado
  }
}
