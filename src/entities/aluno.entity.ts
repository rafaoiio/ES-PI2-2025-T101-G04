// RAFAEL
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('ALUNO')
export class Aluno {
  @PrimaryColumn({ name: 'RA', type: 'number' })
  ra: number;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 150,
    nullable: true,
    unique: true,
  })
  email?: string;
}
