import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Quran Plus API')
    .setDescription(
      'NestJS + PostgreSQL skeleton. Content is uploaded by moderators/admins — not preloaded from public APIs.\n\n' +
        'Password rules: min 8 characters, at least one letter and one number.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`Quran Plus API listening on http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
