import { Logger, ValidationPipe } from '@nestjs/common';
import type { ConfigKeyPaths } from './config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  const configService = app.get(ConfigService<ConfigKeyPaths>);

  const { port, globalPrefix } = configService.get('app', { infer: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({ origin: '*', credentials: true });
  app.setGlobalPrefix(globalPrefix);
  await app.listen(port, '0.0.0.0');
  const appUrl = await app.getUrl();
  const logger = new Logger('Bootstrap');
  logger.log(`Application running at ${appUrl}`);
  logger.log(`Swagger UI available at ${appUrl}/openapi`);
}
bootstrap();
