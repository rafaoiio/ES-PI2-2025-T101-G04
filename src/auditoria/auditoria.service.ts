// PEDRO
/**
 * Serviço responsável pela auditoria de notas.
 * Painel de auditoria ordenado por data/hora decrescente.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaNota } from '../entities/auditoria-nota.entity';
import { Nota } from '../entities/nota.entity';
import { Matricula } from '../entities/matricula.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaNota)
    private auditoriaRepo: Repository<AuditoriaNota>,
    @InjectRepository(Nota)
    private notaRepo: Repository<Nota>,
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,
  ) {}

  /**
   * Lista auditoria de uma turma ordenada por data/hora decrescente.
   * Retorna apenas alterações confirmadas (notas salvas no banco).
   */
  async getAuditoriaPorTurma(idTurma: number) {
    // Busca todas as matrículas da turma
    const matriculas = await this.matriculaRepo.find({
      where: { idTurma },
    });

    if (matriculas.length === 0) {
      return [];
    }

    const idsMatriculas = matriculas.map((m) => m.idMatricula);

    // Busca todas as notas das matrículas usando In()
    const notas = await this.notaRepo
      .createQueryBuilder('nota')
      .where('nota.idMatricula IN (:...ids)', { ids: idsMatriculas })
      .getMany();

    if (notas.length === 0) {
      return [];
    }

    const idsNotas = notas.map((n) => n.idNota);

    // Busca auditorias relacionadas às notas usando In()
    const auditorias = await this.auditoriaRepo
      .createQueryBuilder('auditoria')
      .where('auditoria.idNota IN (:...ids)', { ids: idsNotas })
      .orderBy('auditoria.dataHora', 'DESC') // Ordena por data/hora decrescente
      .getMany();

    return auditorias.map((aud) => ({
      idAuditoria: aud.idAuditoria,
      mensagem: aud.mensagem,
      dataHora: aud.dataHora,
    }));
  }
}
