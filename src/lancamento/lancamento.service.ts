// PEDRO
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Nota } from '../entities/nota.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Turma } from '../entities/turma.entity';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';

/**
 * Serviço responsável pelo lançamento de notas.
 *
 * Gerencia a criação e atualização de notas individuais, garantindo:
 * - Validação de faixa (0.00 a 10.00)
 * - Formatação com 2 casas decimais
 * - Upsert automático (cria se não existe, atualiza se existe)
 *
 * A trigger de auditoria no banco Oracle é acionada automaticamente
 * em INSERT/UPDATE, não sendo responsabilidade deste serviço.
 */
@Injectable()
export class LancamentoService {
  constructor(
    @InjectRepository(Nota)
    private notaRepo: Repository<Nota>,
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
  ) {}

  /**
   * Retorna o grid de lançamento de notas para um componente específico.
   * Por padrão retorna em modo somente leitura.
   *
   * Estrutura otimizada para o frontend: uma linha por aluno com sua nota atual
   * (ou null se ainda não lançada), facilitando a renderização da tabela.
   *
   * @param idTurma Turma para buscar os alunos matriculados
   * @param idComponente Componente de avaliação para buscar as notas
   * @param readonly Se true, retorna flag indicando modo somente leitura
   * @param idProfessor ID do professor logado para validar permissão
   * @returns Array com matriculaId, RA, nome, nota e flag readonly
   */
  async getGrid(
    idTurma: number,
    idComponente: number,
    readonly: boolean = true,
    idProfessor?: number,
  ) {
    // Valida que a turma pertence ao professor (se idProfessor fornecido)
    if (idProfessor) {
      const turma = await this.turmaRepo.findOne({
        where: { idTurma },
      });

      if (!turma) {
        throw new NotFoundException('Turma não encontrada');
      }

      if (turma.idProfessor !== idProfessor) {
        throw new NotFoundException('Turma não encontrada'); // Por segurança, não revela que existe
      }
    }

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma },
      relations: ['aluno'],
    });

    const componente = await this.componenteRepo.findOne({
      where: { idComponente },
    });

    if (!componente) {
      throw new NotFoundException('Componente não encontrado');
    }

    // Busca todas as notas do componente de uma vez
    // Mais eficiente que buscar individualmente para cada aluno
    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
        idComponente,
      },
    });

    return {
      readonly, // Flag de modo somente leitura
      alunos: matriculas.map((mat) => {
        const nota = notas.find((n) => n.idMatricula === mat.idMatricula);
        return {
          matriculaId: mat.idMatricula,
          ra: mat.aluno?.ra || 0,
          nome: mat.aluno?.nome || 'N/A',
          // Formata nota para exibição (2 casas) ou retorna null
          nota: nota ? this.formatNota(nota.valor) : null,
        };
      }),
    };
  }

  /**
   * Atualiza ou cria uma nota para um aluno em um componente.
   *
   * Implementa upsert: se a nota já existe, atualiza; caso contrário, cria.
   * Esta abordagem simplifica o frontend, que não precisa verificar existência.
   *
   * @param idMatricula Matrícula do aluno
   * @param idComponente Componente de avaliação
   * @param dto DTO com o valor da nota (0.00 a 10.00)
   * @param idProfessor ID do professor logado
   * @returns Nota salva (criada ou atualizada)
   */
  async updateNota(
    idMatricula: number,
    idComponente: number,
    dto: UpdateLancamentoDto,
    idProfessor: number,
  ) {
    // Valida que a matrícula pertence a uma turma do professor
    const matricula = await this.matriculaRepo.findOne({
      where: { idMatricula },
      relations: ['turma'],
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    const turma = await this.turmaRepo.findOne({
      where: { idTurma: matricula.idTurma },
    });

    if (!turma || turma.idProfessor !== idProfessor) {
      throw new NotFoundException('Matrícula não encontrada'); // Por segurança
    }
    // Aceita null para representar "não lançado" (traço)
    if (dto.valor === null || dto.valor === undefined) {
      // Remove nota existente (marca como não lançada)
      const nota = await this.notaRepo.findOne({
        where: {
          idMatricula,
          idComponente,
        },
      });

      if (nota) {
        nota.valor = undefined; // Marca como não lançado
        return this.notaRepo.save(nota);
      }

      // Se não existe nota e valor é null, não cria registro
      return null;
    }

    // Formatação prévia garante consistência antes da validação
    const valor = this.formatNota(dto.valor);

    // Validação de faixa: regra de negócio crítica
    // O banco permite até 100, mas o sistema trabalha com escala 0-10
    if (valor < 0 || valor > 10) {
      throw new BadRequestException('Nota deve estar entre 0.00 e 10.00');
    }

    // Busca nota existente para decidir entre update ou insert
    const nota = await this.notaRepo.findOne({
      where: {
        idMatricula,
        idComponente,
      },
    });

    if (nota) {
      // Update: mantém histórico e auditoria existente
      nota.valor = valor;
      return this.notaRepo.save(nota);
    }

    // Insert: cria nova nota
    const novaNota = this.notaRepo.create({
      idMatricula,
      idComponente,
      valor,
      idProfessor,
    });

    return this.notaRepo.save(novaNota);
  }

  /**
   * Atualiza múltiplas notas de diferentes componentes em uma única operação.
   * Modo de Edição Completa.
   */
  async bulkUpdate(
    updates: Array<{
      matriculaId: number;
      componenteId: number;
      valor: number;
    }>,
    idProfessor: number,
  ) {
    const results: Array<{
      matriculaId: number;
      componenteId: number;
      success: boolean;
    }> = [];
    const errors: Array<{
      matriculaId: number;
      componenteId: number;
      error: string;
    }> = [];

    for (const update of updates) {
      try {
        const valor = this.formatNota(update.valor);

        if (valor < 0 || valor > 10) {
          errors.push({
            matriculaId: update.matriculaId,
            componenteId: update.componenteId,
            error: 'Nota deve estar entre 0.00 e 10.00',
          });
          continue;
        }

        const nota = await this.notaRepo.findOne({
          where: {
            idMatricula: update.matriculaId,
            idComponente: update.componenteId,
          },
        });

        if (nota) {
          nota.valor = valor;
          await this.notaRepo.save(nota);
        } else {
          const novaNota = this.notaRepo.create({
            idMatricula: update.matriculaId,
            idComponente: update.componenteId,
            valor,
            idProfessor,
          });
          await this.notaRepo.save(novaNota);
        }

        results.push({
          matriculaId: update.matriculaId,
          componenteId: update.componenteId,
          success: true,
        });
      } catch (error) {
        errors.push({
          matriculaId: update.matriculaId,
          componenteId: update.componenteId,
          error: error.message || 'Erro desconhecido',
        });
      }
    }

    return {
      updated: results.length,
      errors: errors.length > 0 ? errors : undefined,
      results,
    };
  }

  /**
   * Formata nota para 2 casas decimais.
   *
   * Usa arredondamento matemático (Math.round) para evitar problemas
   * de precisão de ponto flutuante.
   *
   * Exemplo: 7.999 → 8.00, 7.995 → 8.00, 7.994 → 7.99
   */
  private formatNota(valor?: number): number {
    if (valor === null || valor === undefined) {
      return 0;
    }
    // Multiplica por 100, arredonda, divide por 100
    // Garante exatamente 2 casas decimais
    return Math.round(valor * 100) / 100;
  }
}
