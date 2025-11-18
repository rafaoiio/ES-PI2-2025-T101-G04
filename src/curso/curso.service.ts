// LUCAS
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entities/curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,
  ) {}

  async create(dto: CreateCursoDto) {
    const curso = this.cursoRepo.create(dto);
    return this.cursoRepo.save(curso);
  }

  async findAll() {
    return this.cursoRepo.find({
      order: { nome: 'ASC' },
    });
  }

  async findByInstituicao(idInstituicao: number) {
    return this.cursoRepo.find({
      where: { idInstituicao },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number) {
    const curso = await this.cursoRepo.findOne({
      where: { idCurso: id },
    });

    if (!curso) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado`);
    }

    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    const curso = await this.findOne(id);

    Object.assign(curso, dto);

    return this.cursoRepo.save(curso);
  }

  async remove(id: number) {
    const curso = await this.findOne(id);
    await this.cursoRepo.remove(curso);
    return { message: 'Curso removido com sucesso' };
  }
}
