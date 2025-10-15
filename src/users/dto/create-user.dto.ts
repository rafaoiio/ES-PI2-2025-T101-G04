//Autor Rafael Gaudencio Dias
//Descrição: Pasta criada para gerenciar todas as operações de usuário, como cadastro, busca, listagem e remoção, garantindo organização 
// e acesso centralizado aos dados dos usuários.

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    // Injeto o repositório do TypeOrm para a entidade User 
  ) {}

  findAll() {
    return this.repo.find();
    // retorno todos os usuários
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
    // Busco um usuário pelo id
  }

  async create(data: Partial<User>) {
    if (!data.name) {
      throw new Error('Campo "name" é obrigatório');
    }
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
// Crio um novo usuário
// checo se um name foi enviado
// o create monta a entidade em memória
//save insere/atualiza no banco


  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.repo.delete(id);
  }
// Removo o usuário por id.
// Eu vou verificar se existe, caso não eu lanço um 404 e então deleto do banco


  async findByEmail(email: string) {
  return this.repo.findOne({ where: { email } });
}
// Busco um usuário por email.
}

export class CreateUserDto{
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
}