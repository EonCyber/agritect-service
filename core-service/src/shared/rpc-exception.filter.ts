import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, of } from 'rxjs';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData<{ id?: string }>();

    const errorResponse = {
      status: 'error',
      error: exception.name || 'UnknownError',
      message: exception.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `[${data?.id || 'no-id'}] ${exception.name}: ${exception.message}`,
      exception.stack,
    );

    // Retorna o erro como um Observable normal que emite o valor de erro
    // Isso evita que a aplicação trave
    return of(errorResponse);
  }
}
