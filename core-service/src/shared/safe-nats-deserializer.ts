import { Logger } from '@nestjs/common';
import type { IncomingRequest, IncomingEvent } from '@nestjs/microservices';
import { NatsRequestJSONDeserializer } from '@nestjs/microservices/deserializers';

/**
 * Custom NATS deserializer que trata erros de desserialização graciosamente
 * ao invés de crashar a aplicação
 */
export class SafeNatsDeserializer extends NatsRequestJSONDeserializer {
  private readonly logger = new Logger('SafeNatsDeserializer');

  deserialize(value: any, options?: Record<string, any>): IncomingRequest | IncomingEvent {
    try {
      return super.deserialize(value, options);
    } catch (error) {
      this.logger.error(
        `Failed to deserialize NATS message. Expected format: {"id":"...", "data":{...}}. Received: ${JSON.stringify(value)}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Tenta extrair o id se existir no payload malformado
      const rawData = this.parseRawData(value);
      const id = rawData?.id || 'deserialization-error';

      // Retorna um request com erro estruturado incluindo o id
      return {
        pattern: undefined,
        data: rawData,
        id,
      } as IncomingRequest;
    }
  }

  private parseRawData(value: any): any {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      if (Buffer.isBuffer(value)) {
        return JSON.parse(value.toString());
      }
      return value;
    } catch {
      return value;
    }
  }
}
