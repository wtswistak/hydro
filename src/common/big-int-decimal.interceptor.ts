import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntDecimalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformBigIntDecimal(data)));
  }

  private transformBigIntDecimal(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'bigint') return data.toString();
    if (data instanceof Decimal) return data.toString();
    if (data instanceof Date) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.transformBigIntDecimal(item));
    }

    if (typeof data === 'object') {
      const transformed: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        transformed[key] = this.transformBigIntDecimal(value);
      }
      return transformed;
    }

    return data;
  }
}
