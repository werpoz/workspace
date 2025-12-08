import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.enableCors();
  const configService = app.get(ConfigService);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API endpoints for authentication and application features')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // deepScanRoutes garantiza que Swagger detecte controladores/routers anidados
  // en módulos importados (como WhatsApp) cuando corremos en modo producción.
  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);


  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/docs`,
  );
}
void bootstrap();
