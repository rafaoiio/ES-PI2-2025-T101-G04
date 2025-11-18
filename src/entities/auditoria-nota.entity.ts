// PEDRO
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nota } from './nota.entity';

@Entity('AUDITORIA_NOTA')
export class AuditoriaNota {
  @PrimaryGeneratedColumn({ name: 'ID_AUDITORIA', type: 'number' })
  idAuditoria: number;

  @Column({ name: 'ID_NOTA', type: 'number' })
  idNota: number;

  @ManyToOne(() => Nota)
  @JoinColumn({ name: 'ID_NOTA' })
  nota?: Nota;

  @Column({ name: 'MENSAGEM', type: 'varchar2', length: 1000, nullable: true })
  mensagem?: string;

  @Column({
    name: 'DATA_HORA',
    type: 'timestamp',
    default: () => 'SYSTIMESTAMP',
  })
  dataHora: Date;
}
