import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception/http-exceptions.filter';
import { AppConfigService } from './config/app-config.service';
import { ApiKeyGuard } from './common/guard/api-key.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.use(cookieParser());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  const configService = app.get(AppConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new ApiKeyGuard(configService, reflector));
  const logger = new Logger('Main');
  app.useLogger(logger);

  await app.listen(configService.port ?? 3000, process.env.HOST);
  logger.log(
    `Server is running on http://${process.env.HOST}:${configService.port ?? 3000}`,
  );
}
bootstrap();
