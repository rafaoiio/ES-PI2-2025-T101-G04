//Autor Rafael Gaudencio Dias
// Descrição: Pasta criada para gerenciar a lógica de autenticação, validando login, senha e gerando tokens de acesso seguros para os usuários.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable() // posso injetar em outros arquivos como dependência
export class AuthService {
  // crio a classe principal responsável pela lógica de autenticação
  constructor(private users: UsersService, private jwt: JwtService) {}
  // recebo o serviço de usuário(para buscar no banco) e o serviço JWT para gerar o token

  async validaoUsuario(email: string, senha: string) {
    // verifico se o usuário e senha estão corretos
    const user = await this.users.findByEmail(email);
    // busco pelo email o usuário no banco
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    // se não encontrar lança o erro de acesso negado


    const ok = await bcrypt.compare(senha, user.senha);
    //comparo a senha que foi digitada com o hash salvo no banco
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    // se tiver errado também bloqueio a entrada

    const { passwordHash, ...safe } = user as any;
    // aqui removo o campo da senha antes de retornar os dados
    return safe;
  }

  async login(user: any)
  // função que gera o token de acesso para o usuário autenticado
   {
    const payload = { sub: user.id, email: user.email, name: user.nome };
    // crio os dados que serão gravados dentro do token 
    return {
      accessToken: await this.jwt.signAsync(payload),
      user,
      // Gero o token JWT e o devolve junto com os dados do usuário
    };
  }
}
