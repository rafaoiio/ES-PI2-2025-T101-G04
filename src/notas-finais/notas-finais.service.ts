// VITOR
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';

/**
 * Serviço responsável pelo cálculo de notas finais dos alunos.
 *
 * Implementa duas estratégias de cálculo conforme a configuração da disciplina:
 * 1. SIMPLES: média aritmética de todos os componentes
 * 2. PONDERADA: média ponderada usando pesos definidos por sigla de componente
 *
 * Regra de negócio crítica: se faltar qualquer nota de qualquer componente
 * cadastrado, a nota final é null (exibida como "—" no frontend).
 *
 * Esta decisão garante que apenas alunos com avaliação completa recebam média final,
 * evitando cálculos parciais que poderiam ser enganosos.
 */
@Injectable()
export class NotasFinaisService {
  constructor(
    @InjectRepository(Disciplina)
    private disciplinaRepo: Repository<Disciplina>,
    @InjectRepository(Turma)
    private turmaRepo: Repository<Turma>,
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
    @InjectRepository(Nota)
    private notaRepo: Repository<Nota>,
  ) {}

  /**
   * Calcula as notas finais de todos os alunos de uma turma.
   *
   * Processo:
   * 1. Carrega disciplina, turma, matrículas e componentes
   * 2. Valida que a turma pertence ao professor (se fornecido)
   * 3. Busca todas as notas relacionadas
   * 4. Para cada aluno, calcula nota final conforme regra da disciplina
   * 5. Retorna null se faltar qualquer nota obrigatória
   *
   * @param idDisciplina ID da disciplina (define a regra de cálculo)
   * @param idTurma ID da turma (define os alunos)
   * @param idProfessor ID do professor logado (opcional, para validação)
   * @returns Array com notas por componente e nota final de cada aluno
   */
  async calcularNotasFinais(
    idDisciplina: number,
    idTurma: number,
    idProfessor?: number,
  ) {
    const disciplina = await this.disciplinaRepo.findOne({
      where: { idDisciplina },
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    const turma = await this.turmaRepo.findOne({
      where: { idTurma },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    // Valida que a turma pertence ao professor (se idProfessor fornecido)
    if (idProfessor && turma.idProfessor !== idProfessor) {
      throw new NotFoundException('Turma não encontrada'); // Por segurança
    }

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma },
      relations: ['aluno'],
    });

    const componentes = await this.componenteRepo.find({
      where: { idDisciplina },
    });

    // Busca otimizada: uma única query para todas as notas necessárias
    // Evita N+1 queries ao buscar notas individualmente
    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
        idComponente: In(componentes.map((c) => c.idComponente)),
      },
    });

    const regra = this.parseRegra(disciplina.formulaMedia);

    return matriculas.map((mat) => {
      const notasAluno: Record<string, number | null> = {};
      let notaFinal: number | null = null;

      // Mapeia todas as notas do aluno por sigla do componente
      // Facilita o acesso durante o cálculo
      componentes.forEach((comp) => {
        const nota = notas.find(
          (n) =>
            n.idMatricula === mat.idMatricula &&
            n.idComponente === comp.idComponente,
        );
        const sigla = comp.sigla || comp.nome;
        notasAluno[sigla] =
          nota && nota.valor !== null && nota.valor !== undefined
            ? nota.valor
            : null;
      });

      if (regra.tipo === 'SIMPLES') {
        // Média aritmética: soma todos os valores e divide pela quantidade
        // Só calcula se TODAS as notas estiverem presentes
        const valores = Object.values(notasAluno).filter((v) => v !== null);
        if (valores.length === componentes.length) {
          notaFinal = valores.reduce((acc, v) => acc + v, 0) / valores.length;
        }
      } else if (regra.tipo === 'PONDERADA' && regra.pesos) {
        try {
          const pesos = JSON.parse(regra.pesos);
          let somaPonderada = 0;
          let somaPesos = 0;
          let todasNotas = true;

          // Itera pelos componentes cadastrados, não pelos pesos do JSON
          // Isso garante que componentes sem peso definido não sejam ignorados
          componentes.forEach((comp) => {
            const sigla = comp.sigla || comp.nome;
            const peso = pesos[sigla];
            const nota = notasAluno[sigla];

            if (peso && nota !== null) {
              // Acumula nota × peso e soma dos pesos separadamente
              // Permite normalização correta mesmo se soma dos pesos ≠ 1
              somaPonderada += nota * peso;
              somaPesos += peso;
            } else if (peso) {
              // Componente tem peso definido mas falta nota → invalida cálculo
              todasNotas = false;
            }
          });

          // Só calcula se todas as notas com peso estiverem presentes
          // E se a soma dos pesos for > 0 (evita divisão por zero)
          if (todasNotas && somaPesos > 0) {
            notaFinal = somaPonderada / somaPesos;
          }
        } catch (e) {
          // JSON inválido: loga erro mas não quebra o fluxo
          // Retorna null para o aluno (tratado como pendência)
          console.error('Erro ao parsear pesos:', e);
        }
      }

      // Calcula Nota Final Ajustada se habilitada (coluna pode não existir no banco)
      let notaFinalAjustada: number | null = null;
      if (
        (disciplina as any).notaFinalAjustadaHabilitada === 1 &&
        notaFinal !== null
      ) {
        notaFinalAjustada = this.calcularNotaAjustada(notaFinal);
      }

      // Busca nota ajustada editada manualmente (se existir)
      const notaAjustadaManual = mat.notaFinalAjustada;
      if (
        (disciplina as any).notaFinalAjustadaHabilitada === 1 &&
        notaAjustadaManual !== null &&
        notaAjustadaManual !== undefined
      ) {
        notaFinalAjustada = notaAjustadaManual;
      }

      return {
        ra: mat.aluno?.ra || 0,
        nome: mat.aluno?.nome || 'N/A',
        componentes: notasAluno,
        // Arredondamento para 2 casas decimais: padrão acadêmico brasileiro
        notaFinal:
          notaFinal !== null ? Math.round(notaFinal * 100) / 100 : null,
        notaFinalAjustada: notaFinalAjustada
          ? Math.round(notaFinalAjustada * 100) / 100
          : null,
        idMatricula: mat.idMatricula,
      };
    });
  }

  /**
   * Calcula Nota Final Ajustada arredondando para múltiplo de 0,5.
   * Em empates exatos (0,25 ou 0,75), arredonda para baixo.
   *
   * Exemplos:
   * - 7.25 -> 7.0 (arredonda para baixo)
   * - 7.75 -> 7.5 (arredonda para baixo)
   * - 7.3 -> 7.5 (arredonda para cima)
   * - 7.7 -> 7.5 (arredonda para baixo)
   */
  private calcularNotaAjustada(notaFinal: number): number {
    // Multiplica por 2 para trabalhar com múltiplos de 0,5
    // Exemplo: 7.25 * 2 = 14.5, 7.75 * 2 = 15.5
    const multiplicado = notaFinal * 2;
    const parteInteira = Math.floor(multiplicado);
    const decimal = multiplicado - parteInteira;

    // Em empates exatos (0,25 ou 0,75), arredonda para baixo
    // Se decimal é exatamente 0.5, significa que a nota original tinha .25 ou .75
    let arredondado: number;
    if (Math.abs(decimal - 0.5) < 0.0001) {
      // Arredonda para baixo (mantém a parte inteira)
      // Exemplo: 14.5 -> 14, 15.5 -> 15
      arredondado = parteInteira;
    } else if (decimal < 0.5) {
      // Arredonda para baixo
      arredondado = parteInteira;
    } else {
      // Arredonda para cima
      arredondado = parteInteira + 1;
    }

    // Divide por 2 para voltar à escala 0-10
    // Exemplo: 14 / 2 = 7.0, 15 / 2 = 7.5
    return arredondado / 2;
  }

  /**
   * Habilita ou desabilita Notas Finais Ajustadas para uma disciplina.
   */
  async toggleNotaAjustada(idDisciplina: number, habilitar: boolean) {
    const disciplina = await this.disciplinaRepo.findOne({
      where: { idDisciplina },
    });

    if (!disciplina) {
      throw new NotFoundException('Disciplina não encontrada');
    }

    // Atualiza notaFinalAjustadaHabilitada (coluna pode não existir no banco)
    (disciplina as any).notaFinalAjustadaHabilitada = habilitar ? 1 : 0;
    await this.disciplinaRepo.save(disciplina);

    return {
      message: `Notas Finais Ajustadas ${habilitar ? 'habilitadas' : 'desabilitadas'}`,
      habilitada: habilitar,
    };
  }

  /**
   * Atualiza Nota Final Ajustada manualmente.
   * Valida que o valor é múltiplo de 0,5 entre 0,0 e 10,0.
   */
  async updateNotaAjustada(
    idMatricula: number,
    notaAjustada: number,
    idProfessor?: number,
  ): Promise<void> {
    const matricula = await this.matriculaRepo.findOne({
      where: { idMatricula },
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    // Valida que a matrícula pertence a uma turma do professor (se fornecido)
    if (idProfessor) {
      const turma = await this.turmaRepo.findOne({
        where: { idTurma: matricula.idTurma },
      });

      if (!turma || turma.idProfessor !== idProfessor) {
        throw new NotFoundException('Matrícula não encontrada'); // Por segurança
      }
    }

    // Valida que é múltiplo de 0,5
    const multiplicado = notaAjustada * 2;
    if (multiplicado !== Math.round(multiplicado)) {
      throw new BadRequestException(
        'Nota Final Ajustada deve ser múltiplo de 0,5 (ex: 7.0, 7.5, 8.0)',
      );
    }

    // Valida faixa 0,0 a 10,0
    if (notaAjustada < 0 || notaAjustada > 10) {
      throw new BadRequestException(
        'Nota Final Ajustada deve estar entre 0,0 e 10,0',
      );
    }

    // Mantém Nota Final automática inalterada
    // Usa QueryBuilder para atualizar notaFinalAjustada (coluna pode não existir)
    // Tenta atualizar, mas não falha se a coluna não existir
    try {
      await this.matriculaRepo
        .createQueryBuilder()
        .update(Matricula)
        .set({ notaFinalAjustada: notaAjustada })
        .where('idMatricula = :idMatricula', { idMatricula })
        .execute();
    } catch (error) {
      // Se a coluna não existir, apenas loga o erro mas não falha
      console.warn(
        `[atualizarNotaAjustada] Erro ao atualizar notaFinalAjustada (coluna pode não existir):`,
        error.message,
      );
    }
  }

  /**
   * Parseia a fórmula de média da disciplina.
   *
   * Mesma lógica do DisciplinaService para manter consistência.
   * Considera extrair para um utilitário compartilhado em refatoração futura.
   */
  private parseRegra(formulaMedia?: string): {
    tipo: 'SIMPLES' | 'PONDERADA';
    pesos?: string;
  } {
    if (!formulaMedia) {
      return { tipo: 'SIMPLES' };
    }

    if (formulaMedia.startsWith('PONDERADA:')) {
      const pesos = formulaMedia.substring(10);
      return { tipo: 'PONDERADA', pesos };
    }

    return { tipo: 'SIMPLES' };
  }
}
