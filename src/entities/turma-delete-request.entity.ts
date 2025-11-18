// RAFAEL
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Turma } from './turma.entity';
import { Professor } from './professor.entity';

/**
 * Entidade que representa solicitações de exclusão de turmas.
 * Sistema de exclusão de turmas com confirmação por email.
 */
@Entity('TURMA_DELETE_REQUEST')
export class TurmaDeleteRequest {
  @PrimaryGeneratedColumn({ name: 'ID_REQUEST', type: 'number' })
  idRequest: number;

  @Column({ name: 'ID_TURMA', type: 'number' })
  idTurma: number;

  @ManyToOne(() => Turma)
  @JoinColumn({ name: 'ID_TURMA' })
  turma?: Turma;

  @Column({ name: 'ID_PROFESSOR', type: 'number' })
  idProfessor: number;

  @ManyToOne(() => Professor)
  @JoinColumn({ name: 'ID_PROFESSOR' })
  professor?: Professor;

  @Column({ name: 'TOKEN', type: 'varchar2', length: 255 })
  token: string;

  @Column({ name: 'HAS_NOTAS', type: 'number', default: 0 })
  hasNotas: number;

  @Column({ name: 'CONFIRMED', type: 'number', default: 0 })
  confirmed: number;

  @Column({ name: 'DELETED', type: 'number', default: 0 })
  deleted: number;

  @Column({ name: 'EXPIRES_AT', type: 'timestamp' })
  expiresAt: Date;

  @Column({
    name: 'CREATED_AT',
    type: 'timestamp',
    default: () => 'SYSTIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'CONFIRMED_AT', type: 'timestamp', nullable: true })
  confirmedAt?: Date;
}

