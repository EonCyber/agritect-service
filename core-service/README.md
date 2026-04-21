# core-service

Microsserviço NestJS com transporte primário via NATS (CQRS + Prisma/PostgreSQL). Expõe também endpoints HTTP para health check e documentação.

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

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agritec"
NATS_URL="nats://localhost:4222"
PORT=3000
```

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

## API & Documentação

Com a aplicação rodando (`npm run start:dev`), os seguintes endpoints ficam disponíveis:

| Endpoint | Descrição |
|---|---|
| `GET /health` | Health check — retorna `{ status: "ok", timestamp }` |
| `GET /api` | Swagger UI — documentação dos endpoints REST |
| `GET /asyncapi` | AsyncAPI UI — documentação dos eventos NATS subscritos |

---

## Estrutura arquitetural

O projeto segue arquitetura hexagonal (Ports & Adapters) com CQRS dentro de cada módulo.

```
src/
├── main.ts                         # Bootstrap do microsserviço NATS
├── app.module.ts                   # Módulo raiz
├── shared/
│   └── prisma.service.ts           # Singleton do PrismaClient
└── modules/
    └── <modulo>/
        ├── domain/                 # (1) Domínio puro
        │   ├── entities/           #     Entidades e regras de negócio
        │   └── errors/             #     Erros de domínio tipados
        ├── app/
        │   ├── commands/           # (2) Command Handlers (escrita)
        │   ├── queries/            # (2) Query Handlers (leitura)
        │   └── ports/              # (2) Interfaces dos repositórios (contratos)
        ├── infra/
        │   └── persistence/        # (3) Implementações Prisma dos repositórios
        └── adapters/
            ├── in/
            │   ├── messaging/      # (4a) Consumers NATS → disparam comandos/queries via buses
            │   └── rest/           # (4b) Controllers HTTP (health check, etc.)
            └── out/                # (4) Adaptadores que ligam ports → infra + exportam tokens DI
```

### Responsabilidade de cada camada

| Camada | Responsabilidade |
|---|---|
| `domain/` | Entidades, value objects e erros de domínio. **Zero** dependências de frameworks. |
| `app/commands/` | `CommandHandler` classes. Orquestram casos de uso de escrita usando as portas. |
| `app/queries/` | `QueryHandler` classes. Consultam dados de leitura via portas. |
| `app/ports/` | Interfaces (contratos) que definem o que a camada de aplicação precisa da infraestrutura. Nunca importa implementações. |
| `infra/persistence/` | Implementações concretas dos repositórios usando Prisma (`Prisma{Entity}Repository`). |
| `adapters/in/messaging/` | Consumers NATS (`@MessagePattern`). Recebem payloads externos e os traduzem em comandos ou queries. |
| `adapters/in/rest/` | Controllers HTTP. Endpoints REST expostos pela aplicação (health check, etc.). |
| `adapters/out/` | Adapters NestJS que conectam as portas (`app/ports/`) às implementações (`infra/`). Exportam os tokens de injeção de dependência. |

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

Todo command handler persiste um registro `CommandExecution` com ciclo de vida:

```
PENDING → RUNNING → COMPLETED
                 ↘ FAILED
```

O status de qualquer execução pode ser consultado via a mensagem NATS `rural-producer.process.status`.
