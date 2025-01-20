import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from './exception/http-exceptions.filter';
import { AppConfigService } from './config/app-config.service';
import { ApiKeyGuard } from './middleware/api-key.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const configService = app.get(AppConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new ApiKeyGuard(configService));
  const logger = new Logger('Main');
  app.useLogger(logger);

  await app.listen(configService.port ?? 3000);
  logger.log(
    `Server is running on http://localhost:${configService.port ?? 3000}`,
  );
}
bootstrap();
