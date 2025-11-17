// LUCAS
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidade que representa a tabela DISCIPLINA.
 *
 * Relação com Curso: mantida apenas como coluna (idCurso) sem decorador de relação
 * para simplificar o escopo acadêmico. Em produção, poderia ter @ManyToOne com Curso.
 */
@Entity('DISCIPLINA')
export class Disciplina {
  @PrimaryGeneratedColumn({ name: 'ID_DISCIPLINA', type: 'number' })
  idDisciplina: number;

  @Column({ name: 'ID_CURSO', type: 'number' })
  idCurso: number;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({ name: 'SIGLA', type: 'varchar2', length: 20, nullable: true })
  sigla?: string;

  @Column({ name: 'CODIGO', type: 'varchar2', length: 20, nullable: true })
  codigo?: string;

  @Column({ name: 'PERIODO', type: 'varchar2', length: 20, nullable: true })
  periodo?: string;

  @Column({ name: 'FORMULA_MEDIA', type: 'clob', nullable: true })
  formulaMedia?: string;

  @Column({
    name: 'NOTA_FINAL_AJUSTADA_HABILITADA',
    type: 'number',
    default: 0,
    nullable: true,
  })
  notaFinalAjustadaHabilitada?: number; // RF037
}