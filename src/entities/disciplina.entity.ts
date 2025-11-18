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

  // Coluna CODIGO removida - não existe no banco de dados
  // Se necessário, adicione a coluna no banco primeiro com: ALTER TABLE DISCIPLINA ADD CODIGO VARCHAR2(20);
  // codigo?: string;

  @Column({ name: 'PERIODO', type: 'varchar2', length: 20, nullable: true })
  periodo?: string;

  @Column({ name: 'FORMULA_MEDIA', type: 'clob', nullable: true })
  formulaMedia?: string;

  // Coluna NOTA_FINAL_AJUSTADA_HABILITADA removida - não existe no banco de dados
  // Se necessário, adicione a coluna no banco primeiro com: ALTER TABLE DISCIPLINA ADD NOTA_FINAL_AJUSTADA_HABILITADA NUMBER DEFAULT 0;
  // notaFinalAjustadaHabilitada?: number;
}
