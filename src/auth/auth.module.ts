//Autor Rafael Gaudencio Dias
//Descrição: Pasta criada para centralizar todo o sistema de login e autenticação, garantindo acesso seguro e controle de usuários no sistema.



import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { StringValue } from 'ms';



@Module({
  imports: [
    UsersModule, // esse é um módulo de usuário ( para buscar usuário no login) -- está no user.module.ts
    PassportModule, // biblioteca que cuida de login
    JwtModule.register({ // vou configurar o cartão de acesso que meu usário recebe ao logar
      secret: process.env.JWT_SECRET!, // defino a chave secreta para assinar o token , o '!' diz que é garantido que exista
      signOptions: { expiresIn: (process.env.JWT_EXPIRES ?? '1d')  as StringValue,
      }
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], // quem faz o trabalho do módulo
  // AuthService é a lógica de login e gera o token
  // LocalStrategy chega o email/senha
  // Jwt confere se o token enviado na requisição é válido
  controllers: [AuthController],
  // defino as rotas HTTP desse módulo
  exports: [AuthService],
  // Permito que outros módulo usem o Auth...
})
export class AuthModule {}
// defino a classe para o Nest usar
