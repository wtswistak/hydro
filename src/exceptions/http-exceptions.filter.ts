import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Error');
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      (exceptionResponse as any).message || 'Internal server error';
    const errorCode = (exceptionResponse as any).errorCode || undefined;
    const finalMessage = Array.isArray(message) ? message[0] : message;
    this.logger.error(finalMessage);
    console.log(exception.stack);

    response.status(status).json({
      statusCode: status,
      errorCode,
      message: finalMessage,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
