// LAURA
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    @InjectRepository(PasswordResetToken)
    private tokenRepo: Repository<PasswordResetToken>,
  ) {}

  async validaoUsuario(email: string, senha: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { senha: _, ...safe } = user as any;
    return safe;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, name: user.nome };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user,
    };
  }

  async getUserById(id: number) {
    return this.users.findOne(id);
  }

  /**
   * Gera token de recuperação de senha e envia email.
   */
  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      // Por segurança, não revela se o email existe ou não
      return { message: 'Se o email existir, um link de recuperação será enviado.' };
    }

    // Gera token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // Invalida tokens anteriores não usados
    await this.tokenRepo.update(
      { idProfessor: user.id, used: 0 },
      { used: 1 },
    );

    // Cria novo token
    const resetToken = this.tokenRepo.create({
      idProfessor: user.id,
      token,
      expiresAt,
      used: 0,
    });
    await this.tokenRepo.save(resetToken);

    // Gera link de recuperação
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // TODO: Integrar com serviço de email real
    // Por enquanto, apenas loga (em desenvolvimento)
    console.log(`\n=== LINK DE RECUPERAÇÃO DE SENHA ===`);
    console.log(`Email: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log(`Token: ${token}`);
    console.log(`Expira em: ${expiresAt.toLocaleString('pt-BR')}`);
    console.log(`=====================================\n`);

    return { message: 'Se o email existir, um link de recuperação será enviado.' };
  }

  /**
   * Redefine senha usando token válido.
   */
  async resetPassword(token: string, novaSenha: string) {
    const resetToken = await this.tokenRepo.findOne({
      where: { token },
      relations: ['professor'],
    });

    if (!resetToken) {
      throw new NotFoundException('Token inválido ou expirado');
    }

    if (resetToken.used === 1) {
      throw new BadRequestException('Token já foi utilizado');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token expirado');
    }

    // Valida nova senha
    if (!novaSenha || novaSenha.length < 6) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    // Atualiza senha do usuário
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.users.updatePassword(resetToken.idProfessor, senhaHash);

    // Marca token como usado
    resetToken.used = 1;
    await this.tokenRepo.save(resetToken);

    return { message: 'Senha redefinida com sucesso' };
  }
}
