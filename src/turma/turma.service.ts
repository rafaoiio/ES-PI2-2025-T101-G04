// RAFAEL
import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Turma } from '../entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';
import { TurmaDeleteRequest } from '../entities/turma-delete-request.entity';
import { Professor } from '../entities/professor.entity';
import * as crypto from 'crypto';

/**
 * Serviço responsável pela lógica de negócio de Turmas.
 *
 * Gerencia turmas vinculadas a disciplinas e fornece visões agregadas
 * úteis para o frontend (overview, componentes com pendências).
 *
 * Otimizações implementadas:
 * - Busca única de todas as notas necessárias (evita N+1 queries)
 * - Cálculo de pendências em memória após carregar dados
 */
@Injectable()
export class TurmaService {
  constructor(
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
    @InjectRepository(Nota)
    private notaRepo: Repository<Nota>,
    @InjectRepository(TurmaDeleteRequest)
    private deleteRequestRepo: Repository<TurmaDeleteRequest>,
    @InjectRepository(Professor)
    private professorRepo: Repository<Professor>,
  ) {}

  /**
   * Lista todas as turmas do professor, opcionalmente filtradas por disciplina.
   *
   * Filtro opcional permite duas visões:
   * - Sem filtro: todas as turmas do professor
   * - Com filtro: turmas de uma disciplina específica do professor
   */
  async findAll(idProfessor: number, disciplinaId?: number) {
    try {
      console.log('[Turma Service] findAll chamado com idProfessor:', idProfessor, 'tipo:', typeof idProfessor);
      console.log('[Turma Service] disciplinaId:', disciplinaId);
      
      // Verifica se há turmas no banco (para debug)
      const todasTurmas = await this.turmaRepo.find({
        select: ['idTurma', 'idDisciplina', 'idProfessor'],
        take: 10,
      });
      console.log('[Turma Service] Primeiras 10 turmas no banco:', todasTurmas);
      
      const queryBuilder = this.turmaRepo
        .createQueryBuilder('turma')
        .leftJoinAndSelect('turma.disciplina', 'disciplina')
        .where('turma.idProfessor = :idProfessor', { idProfessor })
        .orderBy('turma.nomeTurma', 'ASC');

      if (disciplinaId) {
        queryBuilder.andWhere('turma.idDisciplina = :disciplinaId', { disciplinaId });
      }

      // Seleciona apenas colunas que existem no banco (sem CODIGO)
      queryBuilder.select([
        'turma.idTurma',
        'turma.idDisciplina',
        'turma.idProfessor',
        'turma.nomeTurma',
        'turma.horario',
        'turma.sala',
        'turma.capacidade',
        'turma.dataInicio',
        'turma.dataFim',
        'disciplina.idDisciplina',
        'disciplina.idCurso',
        'disciplina.nome',
        'disciplina.sigla',
        'disciplina.periodo',
        'disciplina.formulaMedia',
      ]);

      const turmas = await queryBuilder.getMany();
      console.log('[Turma Service] Turmas encontradas para o professor:', turmas.length);
      console.log('[Turma Service] Turmas:', turmas.map(t => ({ idTurma: t.idTurma, idProfessor: t.idProfessor, nomeTurma: t.nomeTurma })));
      
      return turmas;
    } catch (error) {
      console.error('[Turma Service] Erro ao buscar turmas:', error);
      throw error;
    }
  }

  /**
   * Busca uma turma por ID com disciplina carregada.
   */
  async findOne(id: number) {
    const turma = await this.turmaRepo
      .createQueryBuilder('turma')
      .leftJoinAndSelect('turma.disciplina', 'disciplina')
      .where('turma.idTurma = :id', { id })
      .select([
        'turma.idTurma',
        'turma.idDisciplina',
        'turma.idProfessor',
        'turma.nomeTurma',
        'turma.horario',
        'turma.sala',
        'turma.capacidade',
        'turma.dataInicio',
        'turma.dataFim',
        'disciplina.idDisciplina',
        'disciplina.idCurso',
        'disciplina.nome',
        'disciplina.sigla',
        'disciplina.periodo',
        'disciplina.formulaMedia',
      ])
      .getOne();

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    return turma;
  }

  /**
   * Cria uma nova turma.
   */
  async create(dto: CreateTurmaDto, idProfessor: number) {
    console.log('[Turma Service] Criando turma com idProfessor:', idProfessor);
    console.log('[Turma Service] DTO recebido:', dto);
    
    const turma = this.turmaRepo.create({
      ...dto,
      idProfessor,
    });

    console.log('[Turma Service] Turma criada (antes de salvar):', turma);
    const turmaSalva = await this.turmaRepo.save(turma);
    console.log('[Turma Service] Turma salva:', turmaSalva);
    
    return turmaSalva;
  }

  /**
   * Atualiza uma turma existente.
   * Garante que apenas o dono da turma pode atualizá-la.
   */
  async update(id: number, dto: UpdateTurmaDto, idProfessor?: number) {
    const turma = await this.findOne(id);
    
    // Se idProfessor fornecido, verifica se a turma pertence ao professor
    if (idProfessor !== undefined && turma.idProfessor !== idProfessor) {
      throw new HttpException('Você não tem permissão para atualizar esta turma', HttpStatus.FORBIDDEN);
    }
    
    Object.assign(turma, dto);
    return this.turmaRepo.save(turma);
  }

  /**
   * Remove uma turma.
   * Exclui imediatamente se não houver notas lançadas.
   * Se houver notas, cria solicitação de exclusão e envia email.
   */
  async remove(id: number, idProfessor: number) {
    const turma = await this.findOne(id);

    // Busca todas as matrículas da turma
    const matriculas = await this.matriculaRepo.find({
      where: { idTurma: id },
    });

    let hasNotas = false;
    if (matriculas.length > 0) {
      const idsMatriculas = matriculas.map((m) => m.idMatricula);

      // Verifica se há notas lançadas
      const notasCount = await this.notaRepo.count({
        where: { idMatricula: In(idsMatriculas) },
      });

      hasNotas = notasCount > 0;
    }

    if (hasNotas) {
      // Se houver notas, cria solicitação de exclusão
      return await this.requestDelete(id, idProfessor);
    }

    // Se não houver notas, exclui imediatamente
    return await this.deleteImmediately(id, matriculas);
  }

  /**
   * Exclui turma imediatamente (sem notas).
   */
  private async deleteImmediately(id: number, matriculas: Matricula[]) {
    // Remove primeiro as matrículas (cascade pode não estar configurado)
    if (matriculas.length > 0) {
      await this.matriculaRepo.remove(matriculas);
    }

    await this.turmaRepo.remove(await this.findOne(id));
    return { message: 'Turma removida com sucesso' };
  }

  /**
   * Cria solicitação de exclusão e envia email com link de confirmação.
   */
  private async requestDelete(idTurma: number, idProfessor: number) {
    // Verifica se já existe solicitação pendente
    const existingRequest = await this.deleteRequestRepo.findOne({
      where: { idTurma, confirmed: 0, deleted: 0 },
    });

    if (existingRequest) {
      // Reenvia email com token existente
      const professor = await this.professorRepo.findOne({
        where: { id: idProfessor },
      });

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar-exclusao-turma?token=${existingRequest.token}`;

      console.log(`\n=== SOLICITAÇÃO DE EXCLUSÃO DE TURMA ===`);
      console.log(`Professor: ${professor?.email}`);
      console.log(`Turma ID: ${idTurma}`);
      console.log(`Link: ${resetLink}`);
      console.log(`Token: ${existingRequest.token}`);
      console.log(`Expira em: ${existingRequest.expiresAt.toLocaleString('pt-BR')}`);
      console.log(`========================================\n`);

      return {
        message:
          'Solicitação de exclusão criada. Verifique seu email para confirmar.',
        requiresConfirmation: true,
        token: existingRequest.token,
      };
    }

    // Gera token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token válido por 24 horas

    // Cria solicitação
    const deleteRequest = this.deleteRequestRepo.create({
      idTurma,
      idProfessor,
      token,
      hasNotas: 1,
      confirmed: 0,
      deleted: 0,
      expiresAt,
    });
    await this.deleteRequestRepo.save(deleteRequest);

    // Busca professor para enviar email
    const professor = await this.professorRepo.findOne({
      where: { id: idProfessor },
    });

    // Gera link de confirmação
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/confirmar-exclusao-turma?token=${token}`;

    // TODO: Integrar com serviço de email real
    console.log(`\n=== SOLICITAÇÃO DE EXCLUSÃO DE TURMA ===`);
    console.log(`Professor: ${professor?.email}`);
    console.log(`Turma ID: ${idTurma}`);
    console.log(`Link: ${resetLink}`);
    console.log(`Token: ${token}`);
    console.log(`Expira em: ${expiresAt.toLocaleString('pt-BR')}`);
    console.log(`========================================\n`);

    return {
      message:
        'Solicitação de exclusão criada. Verifique seu email para confirmar.',
      requiresConfirmation: true,
      token,
    };
  }

  /**
   * Confirma exclusão de turma usando token.
   * Torna a exclusão irreversível.
   */
  async confirmDelete(token: string) {
    const request = await this.deleteRequestRepo.findOne({
      where: { token },
      relations: ['turma'],
    });

    if (!request) {
      throw new NotFoundException('Token inválido ou expirado');
    }

    if (request.confirmed === 1 || request.deleted === 1) {
      throw new ConflictException('Esta solicitação já foi processada');
    }

    if (new Date() > request.expiresAt) {
      throw new ConflictException('Token expirado');
    }

    // Torna exclusão irreversível
    request.confirmed = 1;
    request.deleted = 1;
    request.confirmedAt = new Date();
    await this.deleteRequestRepo.save(request);

    // Busca matrículas para excluir
    const matriculas = await this.matriculaRepo.find({
      where: { idTurma: request.idTurma },
    });

    // Exclui turma e matrículas
    if (matriculas.length > 0) {
      await this.matriculaRepo.remove(matriculas);
    }

    const turma = await this.turmaRepo.findOne({
      where: { idTurma: request.idTurma },
    });

    if (turma) {
      await this.turmaRepo.remove(turma);
    }

    return { message: 'Turma excluída permanentemente com sucesso' };
  }

  /**
   * Retorna visão geral da turma com contadores e pendências.
   *
   * Estrutura otimizada para o hub da turma no frontend:
   * - Total de alunos matriculados
   * - Lista de componentes com quantidade de pendências
   *
   * Pendência = aluno sem nota lançada para aquele componente.
   *
   * @param id ID da turma
   * @returns Objeto com alunosCount e componentes com pendentes
   */
  async getOverview(id: number) {
    const turma = await this.findOne(id);
    const alunosCount = await this.matriculaRepo.count({
      where: { idTurma: id },
    });

    // Componentes da disciplina (não da turma diretamente)
    const componentes = await this.componenteRepo.find({
      where: { idDisciplina: turma.idDisciplina },
    });

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma: id },
    });

    // Busca única: todas as notas de todos os alunos e componentes
    // Mais eficiente que buscar individualmente
    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
      },
    });

    // Calcula pendências em memória após carregar dados
    // Trade-off: mais memória, menos queries ao banco
    const componentesComPendencias = componentes.map((comp) => {
      const pendentes = matriculas.filter((mat) => {
        const nota = notas.find(
          (n) =>
            n.idMatricula === mat.idMatricula &&
            n.idComponente === comp.idComponente,
        );
        // Considera pendente se não existe nota OU se valor é null/undefined
        return !nota || nota.valor === null || nota.valor === undefined;
      }).length;

      return {
        idComponente: comp.idComponente,
        sigla: comp.sigla || comp.nome,
        pendentes,
      };
    });

    return {
      alunosCount,
      componentes: componentesComPendencias,
    };
  }

  /**
   * Retorna componentes da disciplina com pendências por componente.
   *
   * Similar ao getOverview, mas focado na lista de componentes
   * para a tela de seleção de lançamento de notas.
   */
  async getComponentes(id: number) {
    const turma = await this.findOne(id);
    const componentes = await this.componenteRepo.find({
      where: { idDisciplina: turma.idDisciplina },
    });

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma: id },
    });

    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
      },
    });

    return componentes.map((comp) => {
      const pendentes = matriculas.filter((mat) => {
        const nota = notas.find(
          (n) =>
            n.idMatricula === mat.idMatricula &&
            n.idComponente === comp.idComponente,
        );
        return !nota || nota.valor === null || nota.valor === undefined;
      }).length;

      return {
        idComponente: comp.idComponente,
        nome: comp.nome,
        sigla: comp.sigla || comp.nome,
        pendentes,
      };
    });
  }
}
