// LUCAS
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Disciplina } from './disciplina.entity';

@Entity('COMPONENTE_NOTA')
export class ComponenteNota {
  @PrimaryGeneratedColumn({ name: 'ID_COMPONENTE', type: 'number' })
  idComponente: number;

  @Column({ name: 'ID_DISCIPLINA', type: 'number' })
  idDisciplina: number;

  @ManyToOne(() => Disciplina)
  @JoinColumn({ name: 'ID_DISCIPLINA' })
  disciplina?: Disciplina;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({ name: 'SIGLA', type: 'varchar2', length: 20, nullable: true })
  sigla?: string;
}
