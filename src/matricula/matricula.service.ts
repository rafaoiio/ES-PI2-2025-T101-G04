// VITOR
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Matricula } from '../entities/matricula.entity';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { Aluno } from '../entities/aluno.entity';
import { Turma } from '../entities/turma.entity';

/**
 * Serviço responsável pela lógica de negócio de Matrículas.
 *
 * Gerencia o vínculo entre Alunos e Turmas através da tabela associativa MATRICULA.
 *
 * Regras de negócio implementadas:
 * - Um aluno não pode estar matriculado duas vezes na mesma turma
 * - Aluno e turma devem existir antes da matrícula
 * - Ordenação alfabética por nome do aluno
 *
 * A restrição UNIQUE(ra, id_turma) no banco garante integridade, mas a validação
 * em aplicação permite mensagens de erro mais claras ao usuário.
 */
@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
    @InjectRepository(Aluno)
    private alunoRepo: Repository<Aluno>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
  ) {}

  /**
   * Lista todas as matrículas de uma turma.
   *
   * Ordenação alfabética por nome do aluno facilita localização
   * no frontend e em relatórios impressos.
   *
   * Ordenação em memória (não no banco) porque TypeORM não suporta
   * order por relação aninhada diretamente em alguns casos.
   */
  async findByTurma(idTurma: number) {
    try {
      console.log(
        `[findByTurma] Iniciando busca de matrículas para turma ${idTurma}`,
      );

      // Busca matrículas sem carregar relacionamento primeiro
      const matriculas = await this.matriculaRepo.find({
        where: { idTurma },
      });

      console.log(`[findByTurma] Encontradas ${matriculas.length} matrículas`);

      if (matriculas.length === 0) {
        return [];
      }

      // Busca alunos separadamente para evitar problemas de relacionamento
      const ras = [...new Set(matriculas.map((m) => m.ra))]; // Remove duplicatas

      console.log(`[findByTurma] RAs únicos encontrados: ${ras.join(', ')}`);

      if (ras.length === 0) {
        console.warn(`[findByTurma] Nenhum RA encontrado nas matrículas`);
        return [];
      }

      // Usa In() diretamente para melhor compatibilidade com Oracle
      // Se In() não funcionar, tenta QueryBuilder como fallback
      let alunos;
      try {
        alunos = await this.alunoRepo.find({
          where: { ra: In(ras) },
        });
      } catch (inError) {
        console.warn(
          '[findByTurma] Erro com In(), tentando QueryBuilder:',
          inError.message,
        );
        // Fallback para QueryBuilder (compatível com Oracle)
        alunos = await this.alunoRepo
          .createQueryBuilder('aluno')
          .where('aluno.ra IN (:...ras)', { ras })
          .getMany();
      }

      console.log(
        `[findByTurma] Encontrados ${alunos.length} alunos de ${ras.length} RAs únicos`,
      );

      // Cria mapa de alunos por RA para lookup rápido
      const alunosMap = new Map(alunos.map((a) => [a.ra, a]));

      // Combina matrículas com alunos e filtra apenas as válidas
      const matriculasComAluno = matriculas
        .map((m) => {
          const aluno = alunosMap.get(m.ra);
          if (!aluno) {
            console.warn(`[findByTurma] Aluno com RA ${m.ra} não encontrado`);
          }
          return aluno ? { ...m, aluno } : null;
        })
        .filter((m): m is Matricula & { aluno: Aluno } => m !== null);

      console.log(
        `[findByTurma] ${matriculasComAluno.length} matrículas válidas (com aluno)`,
      );

      // Ordena alfabeticamente por nome do aluno
      const matriculasOrdenadas = matriculasComAluno.sort((a, b) => {
        const nomeA = a.aluno.nome || '';
        const nomeB = b.aluno.nome || '';
        return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
      });

      // Retorna com estrutura esperada pelo frontend
      // notaFinalAjustada não é incluída porque a coluna pode não existir no banco
      const result = matriculasOrdenadas.map((m) => ({
        idMatricula: m.idMatricula,
        ra: m.ra,
        idTurma: m.idTurma,
        dataMatricula: m.dataMatricula,
        // notaFinalAjustada: m.notaFinalAjustada, // Removido - coluna pode não existir
        aluno: {
          ra: m.aluno.ra,
          nome: m.aluno.nome,
          email: m.aluno.email,
        },
      }));

      console.log(
        `[findByTurma] Retornando ${result.length} matrículas processadas`,
      );
      return result;
    } catch (error) {
      console.error(
        '[findByTurma] Erro ao buscar matrículas por turma:',
        error,
      );
      console.error('[findByTurma] Stack trace:', error.stack);
      console.error('[findByTurma] Turma ID:', idTurma);
      console.error('[findByTurma] Tipo do erro:', error.constructor.name);
      console.error('[findByTurma] Mensagem do erro:', error.message);
      // Re-lança o erro para que o NestJS trate adequadamente
      throw error;
    }
  }

  /**
   * Cria uma nova matrícula vinculando aluno a turma.
   *
   * Validações em cascata:
   * 1. Aluno deve existir (evita matrícula de aluno inexistente)
   * 2. Turma deve existir (evita matrícula em turma inexistente)
   * 3. Matrícula não deve existir (evita duplicatas)
   *
   * Esta ordem de validação permite mensagens de erro mais específicas.
   */
  async create(dto: CreateMatriculaDto) {
    try {
      // Garante que os valores são números
      const ra = typeof dto.ra === 'string' ? parseInt(dto.ra, 10) : dto.ra;
      const idTurma =
        typeof dto.idTurma === 'string'
          ? parseInt(dto.idTurma, 10)
          : dto.idTurma;

      if (isNaN(ra) || isNaN(idTurma)) {
        throw new BadRequestException(
          'RA e ID da turma devem ser números válidos',
        );
      }

      const aluno = await this.alunoRepo.findOne({
        where: { ra },
      });

      if (!aluno) {
        throw new NotFoundException(`Aluno com RA ${ra} não encontrado`);
      }

      const turma = await this.turmaRepo.findOne({
        where: { idTurma },
      });

      if (!turma) {
        throw new NotFoundException(`Turma com ID ${idTurma} não encontrada`);
      }

      // Verifica duplicata antes de criar
      // A constraint UNIQUE no banco também protege, mas esta validação
      // permite retornar 409 com mensagem clara
      // Usa QueryBuilder para evitar selecionar coluna NOTA_FINAL_AJUSTADA que pode não existir
      const existente = await this.matriculaRepo
        .createQueryBuilder('matricula')
        .select([
          'matricula.idMatricula',
          'matricula.ra',
          'matricula.idTurma',
          'matricula.dataMatricula',
        ])
        .where('matricula.ra = :ra', { ra })
        .andWhere('matricula.idTurma = :idTurma', { idTurma })
        .getOne();

      if (existente) {
        throw new ConflictException('Aluno já está matriculado nesta turma');
      }

      const matricula = this.matriculaRepo.create({
        ra,
        idTurma,
      });

      const saved = await this.matriculaRepo.save(matricula);

      // Retorna apenas os campos necessários, sem NOTA_FINAL_AJUSTADA que pode não existir
      return {
        idMatricula: saved.idMatricula,
        ra: saved.ra,
        idTurma: saved.idTurma,
        dataMatricula: saved.dataMatricula,
      };
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      console.error('DTO recebido:', dto);
      console.error('Stack trace:', error.stack);

      // Re-lança exceções do NestJS sem modificação
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Para outros erros, lança BadRequestException genérico
      throw new BadRequestException(
        `Erro ao criar matrícula: ${error.message}`,
      );
    }
  }

  /**
   * Remove uma matrícula (desvincula aluno da turma).
   *
   * Não remove o aluno, apenas o vínculo com a turma.
   * Notas já lançadas permanecem (preservação histórica).
   */
  async remove(id: number) {
    const matricula = await this.matriculaRepo.findOne({
      where: { idMatricula: id },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    await this.matriculaRepo.remove(matricula);
  }

  /**
   * Remove múltiplas matrículas por vez (remoção múltipla de alunos).
   *
   * Remove vários alunos de uma turma de uma vez.
   * Valida que todas as matrículas existem antes de remover.
   */
  async removeMultiple(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Nenhuma matrícula selecionada');
    }

    // Busca todas as matrículas
    const matriculas = await this.matriculaRepo.find({
      where: { idMatricula: ids as any },
    });

    if (matriculas.length !== ids.length) {
      throw new NotFoundException('Algumas matrículas não foram encontradas');
    }

    await this.matriculaRepo.remove(matriculas);
    return {
      message: `${matriculas.length} aluno(s) removido(s) com sucesso`,
      removidos: matriculas.length,
    };
  }
}
