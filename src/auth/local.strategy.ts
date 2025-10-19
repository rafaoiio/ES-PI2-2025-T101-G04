//Autor Rafael Gaudencio Dias
// Descrição: Confere email e senha durante o login.

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
// Crio a classe que defino como o token será validado -- usando o Strategy
{
  constructor(private auth: AuthService) 
  // Recebo o AuthService para usar a função que criei para validar o usuário
  {
    super({ usernameField: 'email'});
    // digo aqui que o campo principal de login é o email
  }

  async validate(email: string, senha: string)
  // função chamada automaticamente quando o usuário tenta logar
  {
    return this.auth.validaoUsuario(email, senha);
    //uso a função validaoUsuario para verificar se usuário e senha estão certos
  }
}
