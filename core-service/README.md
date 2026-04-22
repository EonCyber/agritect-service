# core-service

Aplicação híbrida NestJS (CQRS + Hexagonal Architecture) que combina:
- **NATS** como transporte primário para comunicação assíncrona (padrão request-reply)
- **HTTP** para health check e documentação (Swagger/AsyncAPI)
- **Prisma** como ORM para PostgreSQL
- **bcrypt** para hashing de senhas
- Sistema de logging global para todas as requisições HTTP e mensagens NATS
- Exception handling resiliente com SafeNatsDeserializer

---

## Pré-requisitos

- Node.js >= 20
- PostgreSQL em execução (local ou via Docker)
- NATS Server em execução (local ou via Docker)

### Subindo dependências com Docker (opcional)

```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=agritec -p 5432:5432 postgres:16
docker run -d --name nats -p 4222:4222 nats:latest
```

---

## Configuração

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme seu ambiente:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agritec"

# NATS server URL
NATS_URL="nats://localhost:4222"

# Microservice port (HTTP server)
PORT=3005
```

**Nota**: A aplicação carrega as variáveis de ambiente via `dotenv` antes do bootstrap do NestJS.

---

## Instalação

```bash
npm install
```

---

## Banco de dados

```bash
# Criar e aplicar as migrations
npx prisma migrate dev --name init

# Regenerar o client Prisma após mudanças no schema
npx prisma generate
```

---

## Executando a aplicação

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Produção
npm run build
npm run start:prod
```

---

## Testes

```bash
# Testes unitários (rápido, sem cobertura)
npx jest tests/unit --no-coverage

# Testes unitários com relatório de cobertura
npm run test:cov

# Testes e2e
npm run test:e2e
```

---

## Qualidade de código

```bash
npm run lint      # ESLint com auto-fix
npm run format    # Prettier
```

---

## Eventos NATS disponíveis

A aplicação expõe dois módulos via NATS: **users** e **rural-producer**.

### Módulo Users

| Padrão NATS | Descrição | Payload |
|---|---|---|
| `user.create` | Cria novo usuário | `{ "username": "john", "email": "john@example.com", "password": "secret123", "roles": ["user"] }` |
| `user.update` | Atualiza usuário | `{ "id": "uuid", "username": "john_updated", "active": true, "roles": ["admin"] }` |
| `user.validate` | Valida credenciais (bcrypt) | `{ "email": "john@example.com", "password": "secret123" }` |
| `user.get` | Busca usuário por ID | `{ "id": "uuid" }` |
| `user.get-by-email` | Busca usuário por email | `{ "email": "john@example.com" }` |
| `user.list` | Lista todos os usuários | `{}` (payload vazio) |

**Regras de negócio**:
- IDs são gerados internamente via `randomUUID()`
- Senhas são hashadas com bcrypt (10 salt rounds, mínimo 6 caracteres)
- Roles permitidas: `"admin"` e `"user"` apenas
- `user.validate` retorna dados do usuário **sem** `passwordHash` por segurança

### Módulo Rural Producer

| Padrão NATS | Descrição | Payload |
|---|---|---|
| `rural-producer.create` | Cria produtor rural | `{ "taxId": "12345678901", "taxIdType": "PF", "name": "João Silva" }` |
| `rural-producer.update` | Atualiza nome | `{ "id": "uuid", "name": "João Silva Jr" }` |
| `rural-producer.delete` | Remove produtor | `{ "id": "uuid" }` |
| `rural-producer.get` | Busca por ID | `{ "id": "uuid" }` |
| `rural-producer.list` | Lista todos | `{}` |
| `rural-producer.planting.add` | Adiciona plantio | `{ "ruralProducerId": "uuid", "farmId": "uuid", "cropId": "uuid", "harvestSeasonId": "uuid" }` |
| `rural-producer.planting.remove` | Remove plantio | `{ "ruralProducerId": "uuid", "farmId": "uuid", "cropId": "uuid", "harvestSeasonId": "uuid" }` |
| `rural-producer.process.status` | Status de execução | `{ "processId": "uuid" }` |
| `rural-producer.crop.list` | Lista culturas | `{}` |
| `rural-producer.harvest-season.list` | Lista safras | `{}` |
| `rural-producer.dashboard.metrics` | Métricas gerais | `{}` |
| `rural-producer.dashboard.land-use` | Uso do solo | `{}` |
| `rural-producer.dashboard.crops-distribution` | Distribuição de culturas | `{}` |
| `rural-producer.dashboard.farms-by-state` | Fazendas por estado | `{}` |

### Exemplos de uso com NATS CLI

```bash
# Criar usuário
nats req user.create '{"username":"ian","email":"ian@example.com","password":"pass123","roles":["user"]}'

# Validar credenciais
nats req user.validate '{"email":"ian@example.com","password":"pass123"}'

# Criar produtor rural
nats req rural-producer.create '{"taxId":"12345678901","taxIdType":"PF","name":"João Silva"}'

# Consultar status de processo
nats req rural-producer.process.status '{"processId":"uuid-do-processo"}'

# Listar usuários
nats req user.list '{}'
```

**Nota sobre formato de resposta**: Todos os comandos (create, update, delete, add, remove) retornam:
```json
{
  "processId": "uuid",
  "status": "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
}
```

---

## API & Documentação

Com a aplicação rodando (`npm run start:dev`), os seguintes endpoints ficam disponíveis:

| Endpoint | Descrição |
|---|---|
| `GET http://localhost:3005/health` | Health check — retorna `{ status: "ok", timestamp }` |
| `GET http://localhost:3005/api` | Swagger UI — documentação dos endpoints REST |
| `GET http://localhost:3005/asyncapi` | AsyncAPI UI — documentação dos eventos NATS subscritos |

**Observação**: A aplicação é híbrida:
- Servidor HTTP na porta `3005` (configurável via `PORT` no `.env`)
- Conexão NATS em `localhost:4222` (configurável via `NATS_URL`)
- Queue group: `rural-producer-service` (para load balancing entre réplicas)

---

## Estrutura arquitetural

O projeto segue **Arquitetura Hexagonal** (Ports & Adapters) com **CQRS** dentro de cada módulo.

```
src/
├── main.ts                         # Bootstrap: dotenv + error handlers + NATS + HTTP
├── app.module.ts                   # Módulo raiz (importa UsersModule, RuralProducerModule)
├── shared/
│   ├── prisma.service.ts           # Singleton do PrismaClient (extends PrismaClient)
│   ├── logging.interceptor.ts      # Logging global de HTTP e NATS
│   ├── rpc-exception.filter.ts     # Exception filter para NATS
│   ├── safe-nats-deserializer.ts   # Deserializador resiliente
│   └── messaging.module.ts         # Módulo de configuração NATS
└── modules/
    ├── users/                      # Módulo de usuários (autenticação/autorização)
    │   ├── users.module.ts
    │   ├── domain/
    │   │   ├── entities/           # User
    │   │   ├── enums/              # UserRole
    │   │   └── errors/             # InvalidRoleError, InvalidPasswordError, etc.
    │   ├── app/
    │   │   ├── commands/           # CreateUserHandler, UpdateUserHandler, ValidateUserHandler
    │   │   ├── queries/            # GetUserByIdHandler, GetUserByEmailHandler, ListUsersHandler
    │   │   └── ports/              # UserRepositoryPort, UserReadPort
    │   ├── infra/
    │   │   └── persistence/        # PrismaUserRepository, UserMapper
    │   └── adapters/
    │       ├── in/messaging/       # 6 consumers NATS (create, update, validate, get, get-by-email, list)
    │       └── out/                # UserRepositoryAdapter, UserReadAdapter (DI wiring)
    └── rural-producer/             # Módulo de produtores rurais (domínio principal)
        ├── rural-producer.module.ts
        ├── domain/
        │   ├── entities/           # RuralProducer, Farm, Crop, HarvestSeason, Planting, CommandExecution
        │   └── errors/             # Erros específicos do domínio
        ├── app/
        │   ├── commands/           # 5 command handlers (create, update, delete, add-planting, remove-planting)
        │   ├── queries/            # 8 query handlers (get, list, dashboard metrics, etc.)
        │   └── ports/              # Interfaces para repositórios e leitura
        ├── infra/
        │   └── persistence/        # PrismaRuralProducerRepository, PrismaCropRepository, etc.
        └── adapters/
            ├── in/messaging/       # 15 consumers NATS
            └── out/                # Adapters que conectam ports → infra
```

### Responsabilidade de cada camada

| Camada | Responsabilidade |
|---|---|
| `domain/` | Entidades, value objects, enums e erros de domínio. **Zero** dependências de frameworks. |
| `app/commands/` | `CommandHandler` classes. Orquestram casos de uso de escrita usando as portas. Retornam `CommandExecutionResult`. |
| `app/queries/` | `QueryHandler` classes. Consultam dados de leitura via portas. Retornam DTOs ou modelos de leitura. |
| `app/ports/` | Interfaces (contratos) que definem o que a camada de aplicação precisa da infraestrutura. **Nunca** importa implementações. Usa `import type` para compatibilidade com `isolatedModules`. |
| `infra/persistence/` | Implementações concretas dos repositórios usando Prisma (`Prisma{Entity}Repository`). Mappers para conversão entre entidades de domínio e modelos Prisma. |
| `adapters/in/messaging/` | Consumers NATS (`@MessagePattern`). Recebem payloads externos, validam e os traduzem em comandos ou queries via `CommandBus`/`QueryBus`. |
| `adapters/in/rest/` | Controllers HTTP (`@Controller`). Endpoints REST expostos pela aplicação (apenas health check nesta aplicação). |
| `adapters/out/` | Adapters NestJS que conectam as portas (`app/ports/`) às implementações (`infra/`). Exportam os tokens de injeção de dependência (ex: `USER_REPOSITORY`). |
| `shared/` | Serviços compartilhados: PrismaService, LoggingInterceptor, RpcExceptionFilter, SafeNatsDeserializer, MessagingModule. |

### Observabilidade e Resiliência

A aplicação implementa várias camadas de proteção e logging:

1. **LoggingInterceptor**: Loga todas as requisições HTTP e mensagens NATS com payloads e tempos de resposta
2. **RpcExceptionFilter**: Captura exceções em consumers NATS e retorna respostas estruturadas (não quebra a comunicação)
3. **SafeNatsDeserializer**: Trata mensagens NATS malformadas sem crashar o serviço
4. **Process-level handlers**: `unhandledRejection` e `uncaughtException` para prevenir crash total
5. **CommandExecution tracking**: Todo comando persiste status (PENDING → RUNNING → COMPLETED/FAILED)

### Fluxo de uma mensagem

```
NATS Message
    → Consumer (adapters/in)
        → CommandBus / QueryBus
            → CommandHandler / QueryHandler (app/commands ou app/queries)
                → Port (app/ports)
                    → Adapter (adapters/out)
                        → Repository (infra/persistence)
                            → PostgreSQL via Prisma
```

### Rastreamento de processos

Todo command handler que modifica estado (create, update, delete, add, remove) persiste um registro `CommandExecution` no banco com ciclo de vida:

```
PENDING → RUNNING → COMPLETED
                 ↘ FAILED (com errorMessage)
```

**Campos do CommandExecution**:
- `id`: UUID do processo
- `commandName`: Nome do comando executado (ex: "CreateUserCommand")
- `correlationId`: ID de correlação para rastreamento distribuído (opcional)
- `status`: Status atual (enum)
- `errorMessage`: Mensagem de erro se status = FAILED
- `createdAt`, `startedAt`, `completedAt`: Timestamps do ciclo de vida

O status de qualquer execução pode ser consultado via:
```bash
nats req rural-producer.process.status '{"processId":"uuid-retornado"}'
```

**Nota**: Comandos que falham em validação (antes de salvar CommandExecution) retornam erro via RpcExceptionFilter. Comandos que falham durante execução (depois de salvar) marcam o processo como FAILED.

---

## Convenções de código

### Nomenclatura

- **Arquivos**: `kebab-case.ts` (ex: `create-user.handler.ts`)
- **Classes**: PascalCase (ex: `CreateUserCommandHandler`)
- **Consumers**: `{Action}{Entity}Consumer` (ex: `CreateUserConsumer`)
- **Repositories (implementação)**: `Prisma{Entity}Repository` (ex: `PrismaUserRepository`)
- **Adapters**: `{Entity}RepositoryAdapter` ou `{Entity}ReadAdapter`
- **Padrões NATS**: `'module.entity.action'` (ex: `'user.create'`, `'rural-producer.planting.add'`)

### Tokens de Injeção de Dependência

Tokens são strings exportadas dos arquivos de handler:

```typescript
// Em create-user.handler.ts
export const USER_REPOSITORY = 'USER_REPOSITORY';

// No módulo
providers: [
  { provide: USER_REPOSITORY, useExisting: UserRepositoryAdapter }
]
```

### Import de tipos

Com `isolatedModules: true`, interfaces em classes decoradas **devem** usar `import type`:

```typescript
import type { UserRepositoryPort } from '../ports/user-repository.port';
```

### Prisma Client

Sempre importe do path alias (não do pacote):

```typescript
import { PrismaClient } from '@prisma/client';
import { $Enums } from '@prisma/client';
```

Após mudanças no schema, sempre execute:
```bash
npx prisma generate
```

### Retorno de Command Handlers

Todos os command handlers retornam `Promise<CommandExecutionResult>`:

```typescript
export type CommandExecutionResult = {
  processId: string;
  status: string;
};
```

### Consumers NATS

Pattern atual (payload direto):

```typescript
@MessagePattern('user.create')
execute(@Payload() payload: CreateUserPayloadDto): Promise<CommandExecutionResult> {
  return this.commandBus.execute(new CreateUserCommand(payload.field1, payload.field2));
}
```
---

## Segurança

### Senhas

- Hashadas com **bcrypt** (10 salt rounds)
- Mínimo **6 caracteres**
- **Nunca** retornar `passwordHash` em queries de leitura
- Validação usa `bcrypt.compare()` para timing-attack protection

### Roles

Apenas duas roles permitidas:
- `"admin"`: Acesso administrativo
- `"user"`: Acesso padrão

Validação ocorre na criação da entidade `User` (domain layer).

---
