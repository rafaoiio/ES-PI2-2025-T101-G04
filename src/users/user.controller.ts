// LAURA
//Autor Rafael Gaudencio Dias
//Descrição: Controlador das rotas de usuário: lista, busca por id, cria e remove usuários, usando o serviço para acessar o banco com segurança.

import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  NotFoundException,
  ParseIntPipe,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { Professor } from '../entities/professor.entity';
import { CreateProfessorDto } from './dto/create-user.dto';
import { UpdateProfessorDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
// esse arquivo cuida das rotas que começam com /users
export class UsersController {
  constructor(private readonly users: UsersService) {
    // recebo o UserService que é quem fala com o banco para usar dentro das rotas
  }

  @Get()
  findAll(): Promise<Partial<Professor>[]> {
    // vou devolver uma lista de usuários sem dados sensíveis
    return this.users.findAllPublic();
    // peço ao serviço a lista pública e o devolvo
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Partial<Professor>> {
    // pego o id da URL e garanto que é um número
    const user = await this.users.findOnePublic(id);
    // peço ao serviço os dados públicos desse usuário
    if (!user) throw new NotFoundException('Usuário não encontrado');
    // caso não exista responde um 404
    return user;
  }

  @Post()
  create(@Body() dto: CreateProfessorDto) {
    // lê os dados do corpo da requisição ( que foi validado pelo DTO )
    return this.users.create(dto); // service faz o hash e salva
    // Peço ao serviço para criar
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(@Body() dto: UpdateProfessorDto, @Request() req) {
    return this.users.update(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfessorDto,
    @Request() req,
  ) {
    // Só permite atualizar o próprio perfil
    if (req.user.id !== id) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return this.users.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // garanto que é um número
    return this.users.remove(id);
    //peço para remover e devolve o resultado
  }
}
