// LAURA
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('PROFESSOR')
@Unique(['email'])
export class Professor {
  @PrimaryGeneratedColumn({ name: 'ID_PROFESSOR', type: 'number' })
  id: number;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 150 })
  email: string;

  @Column({ name: 'SENHA', type: 'varchar2', length: 200 })
  senha: string;

  @Column({
    name: 'TELEFONE_CELULAR',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  telefone?: string;
}
