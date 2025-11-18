// VITOR
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Disciplina } from '../entities/disciplina.entity';
import { Turma } from '../entities/turma.entity';
import { Matricula } from '../entities/matricula.entity';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { Nota } from '../entities/nota.entity';
import { NotasFinaisService } from '../notas-finais/notas-finais.service';

/**
 * Serviço responsável pela exportação de notas em formato CSV.
 *
 * Implementa validação rigorosa: só permite exportação quando todas as notas
 * estão lançadas, evitando relatórios incompletos que poderiam causar confusão.
 *
 * Formato do CSV:
 * - Separador: ponto e vírgula (;)
 * - Decimal: vírgula (,) - padrão brasileiro
 * - Encoding: UTF-8
 * - Nome do arquivo: timestamp-turma-sigla.csv
 *
 * Esta escolha de formato facilita abertura em Excel/LibreOffice sem configuração adicional.
 */
@Injectable()
export class ExportacaoService {
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
    private notasFinaisService: NotasFinaisService,
  ) {}

  /**
   * Gera arquivo CSV com as notas finais da turma.
   *
   * Processo:
   * 1. Valida existência de disciplina e turma
   * 2. Valida que a turma pertence ao professor solicitante
   * 3. Verifica pendências (notas faltantes)
   * 4. Se houver pendências, retorna 409 com detalhamento
   * 5. Se tudo OK, calcula notas finais e gera CSV
   *
   * @param idDisciplina Disciplina para identificar componentes
   * @param idTurma Turma para identificar alunos
   * @param idProfessor ID do professor logado para validar permissão
   * @returns Objeto com conteúdo CSV e nome do arquivo
   * @throws ConflictException se houver pendências
   */
  async exportarCSV(idDisciplina: number, idTurma: number, idProfessor?: number) {
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
      throw new NotFoundException('Turma não encontrada'); // Por segurança, não revela que existe
    }

    const componentes = await this.componenteRepo.find({
      where: { idDisciplina },
    });

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma },
      relations: ['aluno'],
    });

    // Busca otimizada: uma query para todas as notas necessárias
    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
        idComponente: In(componentes.map((c) => c.idComponente)),
      },
    });

    // Validação de pendências: verifica cada componente
    // Acumula informações para retornar ao frontend em caso de erro
    const pendencias: Array<{ sigla: string; faltantes: number }> = [];

    componentes.forEach((comp) => {
      const faltantes = matriculas.filter((mat) => {
        const nota = notas.find(
          (n) =>
            n.idMatricula === mat.idMatricula &&
            n.idComponente === comp.idComponente,
        );
        // Considera pendente se não existe nota OU se valor é null/undefined
        // Isso cobre casos de notas criadas mas não preenchidas
        return !nota || nota.valor === null || nota.valor === undefined;
      }).length;

      if (faltantes > 0) {
        pendencias.push({
          sigla: comp.sigla || comp.nome,
          faltantes,
        });
      }
    });

    // Regra de negócio: bloqueia exportação com pendências
    // Retorna 409 (Conflict) com detalhamento para o frontend exibir
    if (pendencias.length > 0) {
      throw new ConflictException({ pendencias });
    }

    // Reutiliza serviço de notas finais para garantir consistência
    // Evita duplicação de lógica de cálculo
    const notasFinais = await this.notasFinaisService.calcularNotasFinais(
      idDisciplina,
      idTurma,
    );

    // Verifica se há Nota Final não calculada para algum aluno
    const alunosSemNotaFinal = notasFinais.filter(
      (nf) => nf.notaFinal === null || nf.notaFinal === undefined,
    );

    if (alunosSemNotaFinal.length > 0) {
      throw new ConflictException({
        message: 'Não é possível exportar: há alunos sem Nota Final calculada',
        alunosSemNotaFinal: alunosSemNotaFinal.map((a) => ({
          ra: a.ra,
          nome: a.nome,
        })),
      });
    }

    // Monta cabeçalho: ra, nome, siglas dos componentes, nota_final, nota_final_ajustada (se habilitada)
    const siglas = componentes.map((c) => c.sigla || c.nome);
    const headerCols = ['ra', 'nome', ...siglas, 'nota_final'];
    
    // Adiciona Nota Final Ajustada se habilitada (coluna pode não existir no banco)
    if ((disciplina as any).notaFinalAjustadaHabilitada === 1) {
      headerCols.push('nota_final_ajustada');
    }
    const header = headerCols.join(';');

    // Monta linhas: uma por aluno
    const rows = notasFinais.map((nf) => {
      const valores = [
        nf.ra.toString(),
        nf.nome,
        // Converte ponto para vírgula (padrão brasileiro)
        // Usa "—" para valores null (mais legível que vazio)
        ...siglas.map((sigla) => {
          const nota = nf.componentes[sigla];
          return nota !== null && nota !== undefined
            ? nota.toFixed(2).replace('.', ',')
            : '—';
        }),
        nf.notaFinal !== null ? nf.notaFinal.toFixed(2).replace('.', ',') : '—',
      ];
      
      // Adiciona Nota Final Ajustada se habilitada (coluna pode não existir no banco)
      if ((disciplina as any).notaFinalAjustadaHabilitada === 1) {
        valores.push(
          nf.notaFinalAjustada !== null
            ? nf.notaFinalAjustada.toFixed(2).replace('.', ',')
            : '—',
        );
      }
      
      return valores.join(';');
    });

    const csv = [header, ...rows].join('\n');

    // Gera timestamp no formato YYYYMMDD_HHmmss
    // Remove caracteres problemáticos para nome de arquivo
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
      .replace('T', '_')
      .substring(0, 15);

    // Nome do arquivo: timestamp-turma-sigla.csv
    // Facilita identificação e ordenação cronológica
    const filename = `${timestamp}-${turma.nomeTurma}-${disciplina.sigla || 'DISC'}.csv`;

    return {
      csv,
      filename,
    };
  }

  /**
   * Gera arquivo JSON com as notas finais da turma.
   * Exportação em formato JSON.
   * Inclui Nota Final Ajustada se habilitada.
   *
   * @param idDisciplina Disciplina para identificar componentes
   * @param idTurma Turma para identificar alunos
   * @param idProfessor ID do professor logado para validar permissão
   * @returns Objeto com conteúdo JSON e nome do arquivo
   * @throws ConflictException se houver pendências
   */
  async exportarJSON(idDisciplina: number, idTurma: number, idProfessor?: number) {
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
      throw new NotFoundException('Turma não encontrada'); // Por segurança, não revela que existe
    }

    const componentes = await this.componenteRepo.find({
      where: { idDisciplina },
    });

    const matriculas = await this.matriculaRepo.find({
      where: { idTurma },
      relations: ['aluno'],
    });

    const notas = await this.notaRepo.find({
      where: {
        idMatricula: In(matriculas.map((m) => m.idMatricula)),
        idComponente: In(componentes.map((c) => c.idComponente)),
      },
    });

    // Validação de pendências (mesma lógica do CSV)
    const pendencias: Array<{ sigla: string; faltantes: number }> = [];

    componentes.forEach((comp) => {
      const faltantes = matriculas.filter((mat) => {
        const nota = notas.find(
          (n) =>
            n.idMatricula === mat.idMatricula &&
            n.idComponente === comp.idComponente,
        );
        return !nota || nota.valor === null || nota.valor === undefined;
      }).length;

      if (faltantes > 0) {
        pendencias.push({
          sigla: comp.sigla || comp.nome,
          faltantes,
        });
      }
    });

    if (pendencias.length > 0) {
      throw new ConflictException({ pendencias });
    }

    // Calcula notas finais
    const notasFinais = await this.notasFinaisService.calcularNotasFinais(
      idDisciplina,
      idTurma,
    );

    // Verifica se há Nota Final não calculada para algum aluno
    const alunosSemNotaFinal = notasFinais.filter(
      (nf) => nf.notaFinal === null || nf.notaFinal === undefined,
    );

    if (alunosSemNotaFinal.length > 0) {
      throw new ConflictException({
        message: 'Não é possível exportar: há alunos sem Nota Final calculada',
        alunosSemNotaFinal: alunosSemNotaFinal.map((a) => ({
          ra: a.ra,
          nome: a.nome,
        })),
      });
    }

    // Monta estrutura JSON
    const siglas = componentes.map((c) => c.sigla || c.nome);
    const dados = notasFinais.map((nf) => {
      const item: any = {
        ra: nf.ra,
        nome: nf.nome,
        componentes: {},
        notaFinal: nf.notaFinal,
      };

      // Adiciona notas de cada componente
      siglas.forEach((sigla) => {
        item.componentes[sigla] = nf.componentes[sigla];
      });

      // Adiciona Nota Final Ajustada se habilitada (coluna pode não existir no banco)
      if ((disciplina as any).notaFinalAjustadaHabilitada === 1) {
        item.notaFinalAjustada = nf.notaFinalAjustada;
      }

      return item;
    });

    const json = JSON.stringify(dados, null, 2);

    // Gera timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
      .replace('T', '_')
      .substring(0, 15);

    const filename = `${timestamp}-${turma.nomeTurma}-${disciplina.sigla || 'DISC'}.json`;

    return {
      json,
      filename,
    };
  }
}
