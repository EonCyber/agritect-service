import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { natsConfig } from './infra/config/nats.config';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import jsyaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('core-service')
    .setDescription('REST API do serviço de produtores rurais')
    .setVersion('1.0')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('core-service')
    .setDescription('Documentação dos eventos NATS subscritos pelo serviço de produtores rurais')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addServer('nats', {
      url: process.env.NATS_URL ?? 'nats://localhost:4222',
      protocol: 'nats',
    })
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(app, asyncApiOptions);
  const httpAdapter = app.getHttpAdapter();
  const jsonDoc = JSON.stringify(asyncapiDocument);
  const yamlDoc = jsyaml.dump(asyncapiDocument);
  httpAdapter.get('/asyncapi-json', (_req: unknown, res: any) => { res.type('application/json'); res.send(jsonDoc); });
  httpAdapter.get('/asyncapi-yaml', (_req: unknown, res: any) => { res.type('text/yaml'); res.send(yamlDoc); });

  app.connectMicroservice(natsConfig);
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
