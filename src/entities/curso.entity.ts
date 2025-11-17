// LUCAS
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidade que representa a tabela CURSO.
 *
 * Relação com Instituicao: mantida apenas como coluna (idInstituicao) sem decorador de relação
 * para simplificar o escopo acadêmico. Em produção, poderia ter @ManyToOne com Instituicao.
 */
@Entity('CURSO')
export class Curso {
  @PrimaryGeneratedColumn({ name: 'ID_CURSO', type: 'number' })
  idCurso: number;

  @Column({ name: 'ID_INSTITUICAO', type: 'number' })
  idInstituicao: number;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({ name: 'SIGLA', type: 'varchar2', length: 20, nullable: true })
  sigla?: string;

  @Column({ name: 'CREDITOS', type: 'number', nullable: true })
  creditos?: number;

  @Column({ name: 'SEMESTRE', type: 'number', nullable: true })
  semestre?: number;

  @Column({ name: 'ANO', type: 'number', nullable: true })
  ano?: number;

  @Column({ name: 'DESCRICAO', type: 'varchar2', length: 1000, nullable: true })
  descricao?: string;

  @Column({ name: 'LOGO_URL', type: 'varchar2', length: 300, nullable: true })
  logoUrl?: string;
}