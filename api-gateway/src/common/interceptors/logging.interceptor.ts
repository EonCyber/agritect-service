import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<'http'>();
    
    if (type !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      body: unknown;
      query: unknown;
      params: unknown;
      headers: { authorization?: string };
    }>();

    const start = Date.now();
    const { method, url, body, query, params, headers } = req;
    
    const sanitizedBody = this.sanitize(body);
    const hasAuth = headers.authorization ? '🔐' : '🔓';

    this.logger.log(
      `${hasAuth} ← ${method} ${url}${Object.keys(query ?? {}).length > 0 ? ` query: ${JSON.stringify(query)}` : ''}${Object.keys(params ?? {}).length > 0 ? ` params: ${JSON.stringify(params)}` : ''}${sanitizedBody ? ` body: ${JSON.stringify(sanitizedBody)}` : ''}`,
    );

    return next.handle().pipe(
      tap({
        next: (result) => {
          const elapsed = Date.now() - start;
          this.logger.log(
            `→ ${method} ${url} ${this.getStatusEmoji(200)} 200 (${elapsed}ms)`,
          );
        },
        error: (err: Error & { status?: number }) => {
          const elapsed = Date.now() - start;
          const status = err.status ?? 500;
          this.logger.error(
            `✗ ${method} ${url} ${this.getStatusEmoji(status)} ${status} error: ${err?.message ?? String(err)} (${elapsed}ms)`,
          );
        },
      }),
    );
  }

  private sanitize(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body } as Record<string, unknown>;
    
    // Remover senhas dos logs
    if ('password' in sanitized) {
      sanitized.password = '***';
    }
    if ('passwordHash' in sanitized) {
      sanitized.passwordHash = '***';
    }

    return sanitized;
  }

  private getStatusEmoji(status: number): string {
    if (status >= 200 && status < 300) return '✓';
    if (status >= 300 && status < 400) return '↪';
    if (status >= 400 && status < 500) return '⚠';
    return '✗';
  }
}
