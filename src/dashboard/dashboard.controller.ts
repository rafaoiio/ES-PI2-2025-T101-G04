// VITOR
import { Controller, Get, Res, UseGuards, Request } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(@Request() req, @Res() res: Response) {
    try {
      // Desabilita cache para sempre retornar dados atualizados
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.removeHeader('ETag');
      
      // req.user vem do JWT strategy (userId, email, name)
      const idProfessorRaw = req.user?.userId;
      console.log('[Dashboard Controller] idProfessor recebido (raw):', idProfessorRaw);
      console.log('[Dashboard Controller] Tipo:', typeof idProfessorRaw);
      console.log('[Dashboard Controller] req.user completo:', JSON.stringify(req.user, null, 2));
      
      if (!idProfessorRaw) {
        console.error('[Dashboard Controller] idProfessor não encontrado em req.user');
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      // Converte para número explicitamente (pode vir como string do JWT)
      const idProfessor = typeof idProfessorRaw === 'string' ? parseInt(idProfessorRaw, 10) : Number(idProfessorRaw);
      console.log('[Dashboard Controller] idProfessor convertido:', idProfessor);
      console.log('[Dashboard Controller] Tipo após conversão:', typeof idProfessor);
      
      if (isNaN(idProfessor)) {
        console.error('[Dashboard Controller] idProfessor não é um número válido:', idProfessorRaw);
        return res.status(400).json({ message: 'ID de professor inválido' });
      }
      
      const metrics = await this.dashboardService.getMetrics(idProfessor);
      console.log('[Dashboard Controller] Métricas calculadas:', metrics);
      return res.json(metrics);
    } catch (error) {
      console.error('[Dashboard Controller] Erro ao buscar métricas:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar métricas',
        error: error.message 
      });
    }
  }

  /**
   * Endpoint para verificar primeiro acesso.
   * Requer autenticação para garantir que está verificando para o professor logado.
   */
  @Get('first-access')
  async checkFirstAccess(@Request() req) {
    console.log('[Dashboard Controller] checkFirstAccess chamado');
    console.log('[Dashboard Controller] req.user:', req.user);
    return this.dashboardService.checkFirstAccess();
  }
}
