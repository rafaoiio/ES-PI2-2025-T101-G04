// LUCAS
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('INSTITUICAO')
export class Instituicao {
  @PrimaryGeneratedColumn({ name: 'ID_INSTITUICAO', type: 'number' })
  idInstituicao: number;

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;

  @Column({ name: 'ENDERECO', type: 'varchar2', length: 200, nullable: true })
  endereco?: string;

  @Column({ name: 'DESCRICAO', type: 'varchar2', length: 4000, nullable: true })
  descricao?: string;
}
