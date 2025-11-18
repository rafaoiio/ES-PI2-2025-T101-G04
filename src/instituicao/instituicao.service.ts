// LUCAS
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instituicao } from '../entities/instituicao.entity';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';
import { Curso } from '../entities/curso.entity';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';

@Injectable()
export class InstituicaoService {
  constructor(
    @InjectRepository(Instituicao)
    private instituicaoRepo: Repository<Instituicao>,
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,
    @InjectRepository(Disciplina)
    private disciplinaRepo: Repository<Disciplina>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
  ) {}

  async create(dto: CreateInstituicaoDto) {
    const instituicao = this.instituicaoRepo.create(dto);
    return this.instituicaoRepo.save(instituicao);
  }

  async findAll() {
    return this.instituicaoRepo.find({
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number) {
    const instituicao = await this.instituicaoRepo.findOne({
      where: { idInstituicao: id },
    });

    if (!instituicao) {
      throw new NotFoundException(`Instituição com ID ${id} não encontrada`);
    }

    return instituicao;
  }

  async update(id: number, dto: UpdateInstituicaoDto) {
    const instituicao = await this.findOne(id);

    Object.assign(instituicao, dto);

    return this.instituicaoRepo.save(instituicao);
  }

  /**
   * Remove uma instituição.
   * Impede exclusão se houver cursos, disciplinas ou turmas vinculadas.
   */
  async remove(id: number) {
    const instituicao = await this.findOne(id);

    // Verifica se há cursos vinculados
    const cursos = await this.cursoRepo.count({
      where: { idInstituicao: id },
    });

    if (cursos > 0) {
      throw new ConflictException(
        'Não é possível excluir esta instituição pois ela possui cursos vinculados.',
      );
    }

    // Verifica se há disciplinas vinculadas (através de cursos)
    // Busca todos os cursos da instituição primeiro
    const cursosDaInstituicao = await this.cursoRepo.find({
      where: { idInstituicao: id },
    });

    if (cursosDaInstituicao.length > 0) {
      const idsCursos = cursosDaInstituicao.map((c) => c.idCurso);
      const disciplinas = await this.disciplinaRepo.find({
        where: { idCurso: idsCursos as any },
      });

      if (disciplinas.length > 0) {
        // Verifica se há turmas vinculadas (através de disciplinas)
        const idsDisciplinas = disciplinas.map((d) => d.idDisciplina);
        const turmas = await this.turmaRepo.count({
          where: { idDisciplina: idsDisciplinas as any },
        });

        if (turmas > 0) {
          throw new ConflictException(
            'Não é possível excluir esta instituição pois ela possui turmas vinculadas através de suas disciplinas.',
          );
        }

        throw new ConflictException(
          'Não é possível excluir esta instituição pois ela possui disciplinas vinculadas através de seus cursos.',
        );
      }
    }

    await this.instituicaoRepo.remove(instituicao);
    return { message: 'Instituição removida com sucesso' };
  }
}
