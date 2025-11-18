// LAURA
/**
 * Serviço responsável pelas operações CRUD de Usuários (Professores).
 *
 * Gerencia criação, busca, atualização e remoção de usuários.
 * Protege dados sensíveis (senha) e valida duplicações de email.
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Professor } from '../entities/professor.entity';
import { CreateProfessorDto } from './dto/create-user.dto';
import { UpdateProfessorDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Professor)
    private repo: Repository<Professor>,
  ) {}

  /**
   * Lista todos os usuários retornando apenas campos públicos.
   */
  findAllPublic() {
    return this.repo.find({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
      },
      order: { id: 'DESC' },
    });
  }

  /**
   * Busca um usuário por ID retornando apenas campos públicos.
   */
  async findOnePublic(id: number) {
    return this.repo.findOne({
      where: { id },
      select: { id: true, nome: true, email: true, telefone: true },
    });
  }

  /**
   * Lista todos os usuários (uso interno - retorna senha também).
   */
  findAll() {
    return this.repo.find();
  }

  /**
   * Busca um usuário por ID.
   */
  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Busca um usuário por email.
   */
  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  /**
   * Cria um novo usuário.
   * Valida duplicação de email e criptografa a senha.
   */
  async create(dto: CreateProfessorDto): Promise<Partial<Professor>> {
    const exists = await this.findByEmail(dto.email);
    if (exists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const professor = this.repo.create({
      nome: dto.nome,
      email: dto.email,
      senha: senhaHash,
      telefone: dto.telefone,
    });

    const salvo = await this.repo.save(professor);
    const { senha: _, ...pub } = salvo as any;
    return pub;
  }

  /**
   * Atualiza um usuário existente.
   * Valida duplicação de email se estiver sendo alterado.
   */
  async update(
    id: number,
    dto: UpdateProfessorDto,
  ): Promise<Partial<Professor>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.findByEmail(dto.email);
      if (exists) {
        throw new ConflictException('E-mail já cadastrado');
      }
    }

    if (dto.nome) user.nome = dto.nome;
    if (dto.email) user.email = dto.email;
    if (dto.telefone !== undefined) user.telefone = dto.telefone;

    if (dto.senha) {
      user.senha = await bcrypt.hash(dto.senha, 10);
    }

    const atualizado = await this.repo.save(user);
    const { senha: _, ...pub } = atualizado as any;
    return pub;
  }

  /**
   * Remove um usuário.
   */
  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.repo.delete(id);
    return { deleted: true };
  }

  /**
   * Atualiza apenas a senha do usuário.
   * Usado para recuperação de senha.
   */
  async updatePassword(id: number, senhaHash: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    user.senha = senhaHash;
    await this.repo.save(user);
  }
}
