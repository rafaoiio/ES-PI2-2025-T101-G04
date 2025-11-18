// VITOR
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Garante que rotas HTML sejam tratadas pelo PagesController antes do ServeStaticModule
  app.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
      // Deixa o NestJS tratar a rota primeiro
      return next();
    }
    next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor rodando na porta ${port}`);
}

bootstrap();
