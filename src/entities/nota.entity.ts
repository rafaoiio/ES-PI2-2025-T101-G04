// PEDRO
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ComponenteNota } from './componente-nota.entity';
import { Matricula } from './matricula.entity';
import { Professor } from './professor.entity';

@Entity('NOTA')
export class Nota {
  @PrimaryGeneratedColumn({ name: 'ID_NOTA', type: 'number' })
  idNota: number;

  @Column({ name: 'ID_COMPONENTE', type: 'number' })
  idComponente: number;

  @ManyToOne(() => ComponenteNota)
  @JoinColumn({ name: 'ID_COMPONENTE' })
  componente?: ComponenteNota;

  @Column({ name: 'ID_MATRICULA', type: 'number' })
  idMatricula: number;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: 'ID_MATRICULA' })
  matricula?: Matricula;

  @Column({
    name: 'VALOR',
    type: 'number',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  valor?: number;

  @Column({ name: 'DATA_LANCAMENTO', type: 'date', default: () => 'SYSDATE' })
  dataLancamento: Date;

  @Column({ name: 'ID_PROFESSOR', type: 'number', nullable: true })
  idProfessor?: number;

  @ManyToOne(() => Professor)
  @JoinColumn({ name: 'ID_PROFESSOR' })
  professor?: Professor;
}
