import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './exceptions/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  const logger = new Logger('Main');
  app.useLogger(logger);

  await app.listen(process.env.PORT ?? 3000);
  logger.log(
    `Server is running on http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
