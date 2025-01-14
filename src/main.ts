import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptions/http-exceptions.filter';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const logger = new Logger('Main');
  app.useLogger(logger);

  await app.listen(configService.port ?? 3000);
  logger.log(
    `Server is running on http://localhost:${configService.port ?? 3000}`,
  );
}
bootstrap();
