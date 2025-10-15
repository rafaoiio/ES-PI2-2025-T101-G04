//Autor Rafael Gaudencio Dias
// Descrição: Gerencia as rotas de autenticação, como login e verificação do usuário logado.


// src/auth/auth.controller.ts é responsável por definir as rotas HTTP relacionadas à autenticação
import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service'; // Contém a lógica, onde gera o token e válida o usuário
import { AuthGuard } from '@nestjs/passport'; 

@Controller('auth') // defino o prefixo das rotas
export class AuthController {
  constructor(private auth: AuthService) {} // o AuthSertvice é injetado pelo Nest

  @UseGuards(AuthGuard('local')) // verifica email/senha e a lógica para essa verificação está no local.strategy
  @Post('login') // defino a rota POST / auth / login
  async login(@Request() req) { // declaro o método login que recebe o objeto da minha requisição.
                                // o req recebe o usuário autenticado preenchido pelo guard local.
    return this.auth.login(req.user);
    // passo o usuário autenticado para o método login()
    // retorno o token JWT
  }

  @UseGuards(AuthGuard('jwt')) // aplica o guard jwt que verifica o token que recebi do header
  @Get('me') // define a rota GET/auth/me
  me(@Request() req) {
    // defino o método me que receb o objeto req
    return req.user; // { userId, email, name }
    // retorno o usuário autenticado
  }
}
