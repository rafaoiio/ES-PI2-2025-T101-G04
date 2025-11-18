// VITOR
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Aluno } from './aluno.entity';
import { Turma } from './turma.entity';

@Entity('MATRICULA')
export class Matricula {
  @PrimaryGeneratedColumn({ name: 'ID_MATRICULA', type: 'number' })
  idMatricula: number;

  @Column({ name: 'RA', type: 'number' })
  ra: number;

  @ManyToOne(() => Aluno)
  @JoinColumn({ name: 'RA' })
  aluno?: Aluno;

  @Column({ name: 'ID_TURMA', type: 'number' })
  idTurma: number;

  @ManyToOne(() => Turma)
  @JoinColumn({ name: 'ID_TURMA' })
  turma?: Turma;

  @Column({ name: 'DATA_MATRICULA', type: 'date', default: () => 'SYSDATE' })
  dataMatricula: Date;

  @Column({
    name: 'NOTA_FINAL_AJUSTADA',
    type: 'number',
    precision: 5,
    scale: 2,
    nullable: true,
    select: false, // Não seleciona automaticamente
    insert: false, // Não insere automaticamente (coluna pode não existir)
    update: false, // Não atualiza automaticamente (coluna pode não existir)
  })
  notaFinalAjustada?: number;
}
