// VITOR
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { ComponenteModule } from './componente/componente.module';
import { TurmaModule } from './turma/turma.module';
import { AlunoModule } from './aluno/aluno.module';
import { MatriculaModule } from './matricula/matricula.module';
import { LancamentoModule } from './lancamento/lancamento.module';
import { NotasFinaisModule } from './notas-finais/notas-finais.module';
import { ExportacaoModule } from './exportacao/exportacao.module';
import { InstituicaoModule } from './instituicao/instituicao.module';
import { CursoModule } from './curso/curso.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

const isDev = process.env.NODE_ENV !== 'production';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} is required`);
  return v;
}

const connectString =
  process.env.ORACLE_CONNECT_STRING ??
  `${requireEnv('ORACLE_HOST')}:${process.env.ORACLE_PORT ?? 1521}/${requireEnv('ORACLE_SERVICE')}`;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'oracle',
      username: process.env.ORACLE_USER!,
      password: process.env.ORACLE_PASSWORD!,
      connectString,
      autoLoadEntities: true,
      synchronize: false,
      logging: isDev ? ['error', 'schema', 'warn'] : ['error'],
    }),
    UsersModule,
    AuthModule,
    DashboardModule,
    InstituicaoModule,
    CursoModule,
    DisciplinaModule,
    ComponenteModule,
    TurmaModule,
    AlunoModule,
    MatriculaModule,
    LancamentoModule,
    NotasFinaisModule,
    ExportacaoModule,
    AuditoriaModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController, PagesController],
  providers: [AppService],
})
export class AppModule {}
