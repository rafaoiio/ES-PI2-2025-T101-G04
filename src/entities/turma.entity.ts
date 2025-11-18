// RAFAEL
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Disciplina } from './disciplina.entity';
import { Professor } from './professor.entity';

@Entity('TURMA')
export class Turma {
  @PrimaryGeneratedColumn({ name: 'ID_TURMA', type: 'number' })
  idTurma: number;

  @Column({ name: 'ID_DISCIPLINA', type: 'number' })
  idDisciplina: number;

  @ManyToOne(() => Disciplina)
  @JoinColumn({ name: 'ID_DISCIPLINA' })
  disciplina?: Disciplina;

  @Column({ name: 'ID_PROFESSOR', type: 'number' })
  idProfessor: number;

  @ManyToOne(() => Professor)
  @JoinColumn({ name: 'ID_PROFESSOR' })
  professor?: Professor;

  @Column({ name: 'NOME_TURMA', type: 'varchar2', length: 120 })
  nomeTurma: string;

  @Column({ name: 'HORARIO', type: 'varchar2', length: 120, nullable: true })
  horario?: string;

  @Column({ name: 'SALA', type: 'varchar2', length: 60, nullable: true })
  sala?: string;

  @Column({ name: 'CAPACIDADE', type: 'number', nullable: true })
  capacidade?: number;

  @Column({ name: 'DATA_INICIO', type: 'date', nullable: true })
  dataInicio?: Date;

  @Column({ name: 'DATA_FIM', type: 'date', nullable: true })
  dataFim?: Date;
}
