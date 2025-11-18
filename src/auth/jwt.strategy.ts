// LAURA
//Autor Rafael Gaudencio Dias
// Descrição: Valida o token JWT e libera acesso apenas a usuários autenticados.
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
// Crio a classe que defino como o token será validado
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: process.env.JWT_SECRET!,
      // uso a chave secreta o .env para validar o token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // digo que o token vem do Header
    });
  }

  async validate(payload: any) {
    // função sendo executada depois que o token é validado
    // dados contidos dentro do token { sub, email, name, iat, exp }
    return { userId: payload.sub, email: payload.email, name: payload.name };
    // retorno as informações do usuário para o request, e deixo acessível
  }
}
