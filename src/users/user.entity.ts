//Autor Rafael Gaudencio Dias
//Descrição: Entidade que representa a tabela de usuários, armazenando dados pessoais, senha criptografada, 
// status ativo e datas de criação e atualização.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('USERS_NOTADEZ')
// diz que essa clasee representa a tabela descrita...
@Unique(['email'])
// garanto que não exista dois usuários com o mesmo email.
export class User {                   
  @PrimaryGeneratedColumn({ type: 'number' })
  id: number;
  //crio a coluna id( que é chave primária ) e é gerada automaticamente

  @Column({ type: 'varchar2', length: 150 })
  name: string;
  // Coluna name

  @Column({ type: 'varchar2', length: 180 })
  email: string;
  // Coluna email

  @Column({ type: 'varchar2', length: 200 })
  passwordHash: string;
  // coluna que guarda a senha, nunca é a senha real

  @Column({type: 'varchar2', length: 30})
  phone?: string;
  // coluna phone

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
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
