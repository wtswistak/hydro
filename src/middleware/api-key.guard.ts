import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: AppConfigService,
    private readonly reflector: Reflector,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;
    if (!apiKey || this.configService.apiKey !== apiKey) {
      throw new UnauthorizedException('Invalid or missing API Key');
    }

    return true;
  }
}
