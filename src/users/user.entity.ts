//Autor: Rafael Gaudnecio Dias
//Descrição: Entidade que representa a tabela de usuários, armazenando dados pessoais, senha criptografada,
//  status ativo e datas de criação e atualização.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('PROFESSOR')
// diz que essa clasee representa a tabela descrita...
@Unique(['email'])
// garanto que não exista dois usuários com o mesmo email.
export class Professor {                   
  @PrimaryGeneratedColumn({ name: 'ID_PROFESSOR', type: 'number' })
  id: number;
  //crio a coluna number( que é chave primária ) e é gerada automaticamente

  @Column({ name: 'NOME', type: 'varchar2', length: 120 })
  nome: string;
  // Coluna name

  @Column({ name: 'EMAIL', type: 'varchar2', length: 150 })
  email: string;
  // Coluna email

  @Column({ name: 'SENHA', type: 'varchar2', length: 200 })
  senha: string; // hash
  // coluna que guarda a senha, nunca é a senha real

  @Column({ name: 'TELEFONE_CELULAR', type: 'varchar2', length: 30, nullable: true })
  telefone?: string;
  // coluna phone

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp', nullable: true })
  createdAt: Date;
  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp', nullable: true })
  updatedAt: Date;
  // Guardo a data e a hora da criação do usuário e se tiver, da atualização


  @Column({
    type:'number',
    precision: 1,
    default: 1,
    transformer:{
      to:(v?: boolean) => (v ? 1 : 0),
      from: (v?: number) => v === 1,
      // verifico se o usuário está ativo (1) ou não (0)
    },
  })
  isActive: boolean;
}
