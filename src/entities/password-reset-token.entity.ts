// LAURA
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Professor } from './professor.entity';

/**
 * Entidade que representa tokens de recuperação de senha.
 * Sistema de recuperação de senha.
 */
@Entity('PASSWORD_RESET_TOKEN')
export class PasswordResetToken {
  @PrimaryGeneratedColumn({ name: 'ID_TOKEN', type: 'number' })
  idToken: number;

  @Column({ name: 'ID_PROFESSOR', type: 'number' })
  idProfessor: number;

  @ManyToOne(() => Professor)
  @JoinColumn({ name: 'ID_PROFESSOR' })
  professor?: Professor;

  @Column({ name: 'TOKEN', type: 'varchar2', length: 255 })
  token: string;

  @Column({ name: 'EXPIRES_AT', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'USED', type: 'number', default: 0 })
  used: number;

  @Column({
    name: 'CREATED_AT',
    type: 'timestamp',
    default: () => 'SYSTIMESTAMP',
  })
  createdAt: Date;
}

