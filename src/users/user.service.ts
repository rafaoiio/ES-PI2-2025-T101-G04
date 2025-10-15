//Autor Rafael Gaudencio Dias
//Descrição: Serviço responsável por todas as ações com usuários: criar, buscar, listar e remover, 
// além de validar duplicações e proteger dados sensíveis como a senha.

import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>)
  //permite que eu use a tabela User no banco
  {}

  
  findAllPublic() 
  //retorna apenas campos públicos
  {
    return this.repo.find({
      select: 
      { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        createdAt: true, 
        updatedAt: true 
      },
        order: { id: 'DESC' },
    });
    // Peço ao TypeOrm para buscar todos os usuários, mostrando apenas os campos listados acima
  }

  async findOnePublic(id: number) {
    return this.repo.findOne({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    //Retorno apenas um usuário pelo Id, retornando apenas os campos públicos
  }

  findAll() {
    return this.repo.find();
    // Uso só internamente pois retorna a senha também
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
    // Busco um usuário pelo id
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
    // Busco um usuário pelo email
  }

  async create(dto: CreateUserDto): Promise<Partial<User>> {
    //crio um novo usuário a partir dos dados cadastrados


    const exists = await this.findByEmail(dto.email);
    if (exists) throw new ConflictException('E-mail já cadastrado');
    // Verifico se o email já existe e se sim ele impede o cadastro

    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = this.repo.create({
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone:dto.phone,
      });
      // Criptografo a senha com o bcrypt e nunca salvo a senha real

      const saved = await this.repo.save(user);
      // salfvo o novo usuário no banco

      const { passwordHash: _, ...pub } = saved as any;
      return pub;
      // Removo o campo da senha e devolvo só os dados públicos

    } catch (e: any) {
      // Mapeia erros comuns do Oracle
      if (e?.code === 'ORA-00001') throw new ConflictException('E-mail já cadastrado'); // unique
      if (e?.code === 'ORA-00942') throw new InternalServerErrorException('Tabela USERS não existe. Rode as migrations.');
      console.error('ERRO create(user):', e);
      throw new InternalServerErrorException('Falha ao salvar usuário');

      // Alguns erros que podem dar, retorno tudo claramente ao usuário
    }
  }

  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.repo.delete(id);
    return { deleted: true };
  }
  // Apago um usuário pelo Id, verificando se ele existe, deleto e retorno uma confirmação
}
