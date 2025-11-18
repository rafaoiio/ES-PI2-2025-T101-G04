// LUCAS
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComponenteNota } from '../entities/componente-nota.entity';
import { CreateComponenteDto } from './dto/create-componente.dto';
import { UpdateComponenteDto } from './dto/update-componente.dto';
import { Nota } from '../entities/nota.entity';

/**
 * Serviço responsável pela lógica de negócio de Componentes de Nota.
 *
 * Gerencia componentes avaliativos (ex: P1, P2, T1) vinculados a disciplinas.
 *
 * Regras de negócio implementadas:
 * - Sigla única por disciplina (evita ambiguidade no cálculo de médias)
 * - Bloqueio de exclusão se houver notas lançadas (preserva integridade histórica)
 *
 * A validação de sigla única é feita em aplicação (não no banco) para permitir
 * mensagens de erro mais amigáveis ao usuário.
 */
@Injectable()
export class ComponenteService {
  constructor(
    @InjectRepository(ComponenteNota)
    private componenteRepo: Repository<ComponenteNota>,
    @InjectRepository(Nota)
    private notaRepo: Repository<Nota>,
  ) {}

  /**
   * Lista todos os componentes de uma disciplina.
   *
   * Ordenação por sigla facilita identificação visual no frontend.
   */
  async findByDisciplina(idDisciplina: number) {
    return this.componenteRepo.find({
      where: { idDisciplina },
      order: { sigla: 'ASC' },
    });
  }

  /**
   * Busca um componente por ID.
   */
  async findOne(id: number) {
    const componente = await this.componenteRepo.findOne({
      where: { idComponente: id },
    });

    if (!componente) {
      throw new NotFoundException('Componente não encontrado');
    }

    return componente;
  }

  /**
   * Cria um novo componente de nota.
   *
   * Valida sigla única antes de criar para evitar duplicatas que
   * quebrariam o cálculo de médias ponderadas (que usa sigla como chave).
   */
  async create(dto: CreateComponenteDto) {
    const existente = await this.componenteRepo.findOne({
      where: {
        idDisciplina: dto.idDisciplina,
        sigla: dto.sigla,
      },
    });

    if (existente) {
      throw new ConflictException(
        'Já existe um componente com esta sigla nesta disciplina',
      );
    }

    const componente = this.componenteRepo.create(dto);
    return this.componenteRepo.save(componente);
  }

  /**
   * Atualiza um componente existente.
   *
   * Se a sigla estiver sendo alterada, valida unicidade novamente
   * para manter a integridade da regra de negócio.
   */
  async update(id: number, dto: UpdateComponenteDto) {
    const componente = await this.componenteRepo.findOne({
      where: { idComponente: id },
    });

    if (!componente) {
      throw new NotFoundException('Componente não encontrado');
    }

    // Validação apenas se sigla estiver sendo alterada
    // Evita query desnecessária quando outros campos são atualizados
    if (dto.sigla && dto.sigla !== componente.sigla) {
      const existente = await this.componenteRepo.findOne({
        where: {
          idDisciplina: componente.idDisciplina,
          sigla: dto.sigla,
        },
      });

      if (existente) {
        throw new ConflictException(
          'Já existe um componente com esta sigla nesta disciplina',
        );
      }
    }

    Object.assign(componente, dto);
    return this.componenteRepo.save(componente);
  }

  /**
   * Remove um componente de nota.
   *
   * Bloqueia exclusão se houver notas lançadas para preservar:
   * - Integridade histórica (notas já calculadas)
   * - Rastreabilidade (auditoria vinculada ao componente)
   * - Consistência de relatórios (evita "componente fantasma")
   *
   * Esta é uma decisão de design: em vez de cascade delete ou soft delete,
   * optamos por bloquear explicitamente para forçar decisão consciente do usuário.
   */
  async remove(id: number) {
    const componente = await this.componenteRepo.findOne({
      where: { idComponente: id },
    });

    if (!componente) {
      throw new NotFoundException('Componente não encontrado');
    }

    // Verifica existência de notas antes de excluir
    // Usa count() em vez de find() para melhor performance
    const notas = await this.notaRepo.count({
      where: { idComponente: id },
    });

    if (notas > 0) {
      throw new ConflictException(
        'Não é possível excluir componente que possui notas lançadas',
      );
    }

    await this.componenteRepo.remove(componente);
  }
}
