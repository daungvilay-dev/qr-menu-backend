import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000, '0.0.0.0');
  const appUrl = await app.getUrl();
  const logger = new Logger('Bootstrap');
  logger.log(`Application running at ${appUrl}`);
  logger.log(`Swagger UI available at ${appUrl}/openapi`);
}
bootstrap();
