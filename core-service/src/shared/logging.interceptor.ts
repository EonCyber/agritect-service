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
  private readonly logger = new Logger('Incoming');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const type = context.getType<'http' | 'rpc'>();
    const start = Date.now();

    if (type === 'rpc') {
      const rpcContext = context.switchToRpc();
      const natsContext = rpcContext.getContext<{ getSubject?: () => string }>();
      const subject = natsContext?.getSubject?.() ?? 'unknown';
      const payload = rpcContext.getData();
      const requestId = (payload as { id?: string })?.id ?? 'no-id';
      
      this.logger.log(`[NATS] ← ${subject} [${requestId}] payload: ${JSON.stringify(payload)}`);

      return next.handle().pipe(
        tap({
          next: (result) => {
            this.logger.log(
              `[NATS] → ${subject} [${requestId}] reply: ${JSON.stringify(result)} (${Date.now() - start}ms)`,
            );
          },
          error: (err: Error) => {
            this.logger.error(
              `[NATS] ✗ ${subject} [${requestId}] error: ${err?.message ?? String(err)} (${Date.now() - start}ms)`,
            );
          },
        }),
      );
    }

    if (type === 'http') {
      const req = context.switchToHttp().getRequest<{
        method: string;
        url: string;
        body: unknown;
        query: unknown;
        params: unknown;
      }>();
      const { method, url, body, query, params } = req;
      this.logger.log(
        `[HTTP] ← ${method} ${url} body: ${JSON.stringify(body)} query: ${JSON.stringify(query)} params: ${JSON.stringify(params)}`,
      );

      return next.handle().pipe(
        tap({
          next: (result) => {
            this.logger.log(
              `[HTTP] → ${method} ${url} reply: ${JSON.stringify(result)} (${Date.now() - start}ms)`,
            );
          },
          error: (err: Error) => {
            this.logger.error(
              `[HTTP] ✗ ${method} ${url} error: ${err?.message ?? String(err)} (${Date.now() - start}ms)`,
            );
          },
        }),
      );
    }

    return next.handle();
  }
}
