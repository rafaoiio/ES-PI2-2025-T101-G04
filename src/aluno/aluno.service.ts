// RAFAEL
/**
 * Serviço responsável pelas operações CRUD de Alunos.
 *
 * Gerencia criação, busca e listagem de alunos.
 * O método createOrUpdate cria um novo aluno ou atualiza se já existir.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../entities/aluno.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private alunoRepo: Repository<Aluno>,
  ) {}

  /**
   * Cria um novo aluno ou atualiza se já existir (baseado no RA).
   */
  async createOrUpdate(dto: CreateAlunoDto) {
    const existente = await this.alunoRepo.findOne({
      where: { ra: dto.ra },
    });

    if (existente) {
      existente.nome = dto.nome;
      if (dto.email) existente.email = dto.email;
      return this.alunoRepo.save(existente);
    }

    const aluno = this.alunoRepo.create(dto);
    return this.alunoRepo.save(aluno);
  }

  /**
   * Lista todos os alunos ordenados por nome.
   * Se idProfessor fornecido, retorna apenas alunos matriculados em turmas do professor.
   */
  async findAll(idProfessor?: number) {
    if (idProfessor) {
      // Busca alunos apenas das turmas do professor
      const turmaRepo = this.alunoRepo.manager.getRepository('Turma');
      const turmas = await turmaRepo.find({
        where: { idProfessor },
        select: ['idTurma'],
      });

      if (turmas.length === 0) {
        return [];
      }

      const turmasIds = turmas.map((t: { idTurma: number }) => t.idTurma);

      // Busca matrículas dessas turmas
      const matriculaRepo = this.alunoRepo.manager.getRepository('Matricula');
      const matriculas = await matriculaRepo
        .createQueryBuilder('matricula')
        .select('DISTINCT matricula.ra', 'ra')
        .where('matricula.idTurma IN (:...turmasIds)', { turmasIds })
        .getRawMany();

      if (matriculas.length === 0) {
        return [];
      }

      const ras = matriculas.map((m: { ra: number }) => m.ra);

      // Busca alunos com esses RAs
      return this.alunoRepo
        .createQueryBuilder('aluno')
        .where('aluno.ra IN (:...ras)', { ras })
        .orderBy('aluno.nome', 'ASC')
        .getMany();
    }

    // Se não há filtro, retorna todos (para coordenadores)
    return this.alunoRepo.find({
      order: { nome: 'ASC' },
    });
  }

  /**
   * Busca um aluno por RA.
   */
  async findOne(ra: number) {
    return this.alunoRepo.findOne({
      where: { ra },
    });
  }

  /**
   * Remove múltiplos alunos por seus RAs.
   */
  async removeBulk(ras: number[]) {
    if (!ras || ras.length === 0) {
      throw new Error('Nenhum RA fornecido para exclusão');
    }

    // Usa In() corretamente com QueryBuilder
    const alunos = await this.alunoRepo
      .createQueryBuilder('aluno')
      .where('aluno.ra IN (:...ras)', { ras })
      .getMany();

    if (alunos.length === 0) {
      return { message: 'Nenhum aluno encontrado para exclusão', deleted: 0 };
    }

    await this.alunoRepo.remove(alunos);
    return {
      message: `${alunos.length} aluno(s) removido(s) com sucesso`,
      deleted: alunos.length,
    };
  }

  /**
   * Importa alunos de um arquivo CSV.
   * Formato esperado: 2 primeiras colunas = identificador (RA), nome
   */
  async importFromCSV(csvContent: string) {
    const lines = csvContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('Arquivo CSV inválido ou vazio');
    }

    const alunos: CreateAlunoDto[] = [];
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    // Pula cabeçalho (primeira linha)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Divide por vírgula ou ponto e vírgula
      const parts = line.split(/[,;]/).map((p) => p.trim());

      if (parts.length < 2) {
        errors.push(`Linha ${i + 1}: Formato inválido`);
        continue;
      }

      const ra = parseInt(parts[0]);
      const nome = parts[1];

      if (isNaN(ra) || !nome) {
        errors.push(`Linha ${i + 1}: RA ou nome inválido`);
        continue;
      }

      // Verifica duplicata e preserva dados existentes
      const existente = await this.alunoRepo.findOne({ where: { ra } });
      if (existente) {
        skipped++;
        continue; // Preserva dados existentes
      }

      alunos.push({ ra, nome });
    }

    // Salva todos os alunos novos
    if (alunos.length > 0) {
      const novosAlunos = this.alunoRepo.create(alunos);
      await this.alunoRepo.save(novosAlunos);
      imported = novosAlunos.length;
    }

    return {
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      total: imported + skipped,
    };
  }

  /**
   * Importa alunos de um arquivo JSON.
   * Formato esperado: array de objetos com pelo menos "identificador" (ou "ra") e "nome"
   */
  async importFromJSON(jsonContent: string) {
    let dados: any[];
    try {
      dados = JSON.parse(jsonContent);
    } catch (e) {
      throw new Error('JSON inválido');
    }

    if (!Array.isArray(dados)) {
      throw new Error('JSON deve ser um array de objetos');
    }

    const alunos: CreateAlunoDto[] = [];
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    dados.forEach((item, index) => {
      // Aceita "identificador", "ra" ou "RA" como chave
      const ra =
        item.identificador || item.ra || item.RA || item.id || item.ID;
      const nome = item.nome || item.name || item.NOME || item.NAME;

      if (!ra || !nome) {
        errors.push(
          `Item ${index + 1}: Faltam campos obrigatórios (identificador/ra e nome)`,
        );
        return;
      }

      const raNum = parseInt(String(ra));
      if (isNaN(raNum)) {
        errors.push(`Item ${index + 1}: Identificador inválido`);
        return;
      }

      alunos.push({ ra: raNum, nome: String(nome), email: item.email });
    });

    // Verifica duplicatas e preserva dados existentes
    for (const alunoDto of alunos) {
      const existente = await this.alunoRepo.findOne({
        where: { ra: alunoDto.ra },
      });
      if (existente) {
        skipped++;
        continue; // Preserva dados existentes
      }

      const novoAluno = this.alunoRepo.create(alunoDto);
      await this.alunoRepo.save(novoAluno);
      imported++;
    }

    return {
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      total: imported + skipped,
    };
  }
}
