// LAURA
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req) {
    const result = await this.auth.login(req.user);
    return {
      token: result.accessToken,
      user: {
        id: result.user.id,
        nome: result.user.nome,
        email: result.user.email,
      },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req) {
    const user = await this.auth.getUserById(req.user.userId);
    const { senha: _, ...safe } = user as any;
    return safe;
  }

  /**
   * Endpoint para solicitar recuperação de senha.
   */
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  /**
   * Endpoint para redefinir senha usando token.
   */
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; novaSenha: string }) {
    return this.auth.resetPassword(body.token, body.novaSenha);
  }
}
