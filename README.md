# Agritec Platform

Sistema de gerenciamento de produtores rurais construído com arquitetura de microserviços, utilizando NestJS, NATS para mensageria assíncrona e PostgreSQL como banco de dados.

## 🏗️ Arquitetura

A plataforma é composta por dois serviços principais que se comunicam de forma assíncrona via NATS:

```
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│                     (porta 3000)                            │
│                                                              │
│  • REST API pública com autenticação JWT                    │
│  • Swagger UI: /api/v1/docs                                 │
│  • Controllers: Auth, Rural, Health                         │
│  • Publica comandos/queries via NATS                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ NATS Request-Reply Pattern
                  │ (porta 4222)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Service                             │
│                   (porta 3005)                              │
│                                                              │
│  • Aplicação híbrida: HTTP + NATS Microservice              │
│  • Arquitetura: CQRS + Hexagonal                           │
│  • Swagger UI: /api                                         │
│  • AsyncAPI: /asyncapi-json, /asyncapi-yaml                 │
│  • Módulos: RuralProducer, Users                           │
│  • Prisma ORM → PostgreSQL                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
            ┌──────────┐
            │PostgreSQL│
            │(porta    │
            │ 5432)    │
            └──────────┘
```

---

## 📦 API Gateway

**Objetivo:** Ponto de entrada único para todas as requisições HTTP externas. Atua como orquestrador, recebendo requisições REST, autenticando usuários via JWT e delegando operações para o Core Service via NATS.

### Funcionalidades

#### 🔐 Autenticação (`/api/v1/auth`)
- `POST /signup` - Cadastro de novos usuários
- `POST /login` - Autenticação e geração de JWT
- `POST /logout` - Invalidação de token (client-side)
- `GET /me` - Dados do usuário autenticado

#### 🌾 Produtores Rurais (`/api/v1/rural`)
Todas as rotas protegidas por JWT (`@UseGuards(JwtAuthGuard)`):

**Comandos (assíncronos - retornam HTTP 202 Accepted):**
- `POST /producer` - Criar produtor rural
- `PUT /producer/:id` - Atualizar produtor rural
- `DELETE /producer/:id` - Deletar produtor rural
- `POST /producer/:id/planting` - Adicionar plantio
- `DELETE /producer/:id/planting` - Remover plantio

**Queries (síncronas):**
- `GET /producer/:id` - Buscar produtor por ID
- `GET /producer` - Listar produtores rurais
- `GET /process/:processId` - Verificar status de comando assíncrono

**Dashboard:**
- `GET /dashboard/metrics` - Métricas gerais
- `GET /dashboard/farms-by-state` - Fazendas por estado
- `GET /dashboard/crops-distribution` - Distribuição de culturas
- `GET /dashboard/land-use` - Uso de terra (agricultável vs vegetação)

**Dados de referência:**
- `GET /crops` - Lista de culturas disponíveis
- `GET /harvest-seasons` - Safras disponíveis

#### ⚕️ Health Check (`/api/v1/health`)
- `GET /` - Status de saúde do API Gateway

### Stack Técnica
- NestJS (REST API)
- Passport JWT (autenticação)
- class-validator (validação de DTOs)
- NATS Client (comunicação com Core Service)
- Swagger/OpenAPI (documentação)

---

## ⚙️ Core Service

**Objetivo:** Serviço de domínio responsável por toda a lógica de negócio, persistência de dados e processamento de comandos/queries. Implementa arquitetura hexagonal (ports & adapters) com padrão CQRS.

### Funcionalidades

#### Módulos de Domínio

**1. Rural Producer Module**
- **Comandos:** Criação, atualização, remoção de produtores e plantios
- **Queries:** Busca individual, listagem, métricas de dashboard
- **Agregados:** RuralProducer, Farm, Planting
- **Eventos:** Processamento assíncrono com status tracking

**2. Users Module**
- **Comandos:** Criação e atualização de usuários
- **Queries:** Busca por ID, por email, listagem, validação de credenciais
- **Hash de senhas:** bcrypt

**3. Other Module**
- Dados de referência (crops, harvest seasons)

### Arquitetura Interna

```
core-service/
└── modules/
    └── rural-producer/
        ├── adapters/
        │   ├── in/
        │   │   └── messaging/     # NATS consumers (@MessagePattern)
        │   └── out/
        │       └── persistence/   # Prisma repositories
        ├── application/
        │   ├── commands/          # Command handlers (CQRS)
        │   └── queries/           # Query handlers (CQRS)
        └── domain/
            ├── entities/          # Agregados e entidades
            └── ports/             # Interfaces (hexagonal)
```

### Stack Técnica
- NestJS (framework híbrido HTTP + NATS)
- Prisma ORM (PostgreSQL)
- NATS Server (microservice transport)
- bcrypt (hashing de senhas)
- AsyncAPI (documentação de eventos)
- Swagger/OpenAPI (documentação REST)

---

## 🔌 Wiring Up - Comunicação entre Serviços

A comunicação entre API Gateway e Core Service ocorre via **NATS** usando o padrão **Request-Reply**:

### Fluxo de Comunicação

1. **Cliente HTTP** → envia requisição para API Gateway
2. **API Gateway** → valida JWT, transforma para DTO de mensageria
3. **API Gateway** → publica mensagem NATS com subject específico (ex: `rural-producer.create`)
4. **Core Service** → consumer escuta o subject via `@MessagePattern`
5. **Core Service** → processa comando/query e retorna resultado
6. **API Gateway** → transforma resposta e retorna HTTP ao cliente

### Subjects NATS Utilizados

#### Comandos de Produtores Rurais
```typescript
'rural-producer.create'          // Criar produtor
'rural-producer.update'          // Atualizar produtor
'rural-producer.delete'          // Deletar produtor
'rural-producer.planting.add'    // Adicionar plantio
'rural-producer.planting.remove' // Remover plantio
```

#### Queries de Produtores Rurais
```typescript
'rural-producer.get'                      // Buscar por ID
'rural-producer.list'                     // Listar produtores
'rural-producer.process.status'           // Status de processamento
'rural-producer.dashboard.metrics'        // Métricas do dashboard
'rural-producer.dashboard.farms-by-state' // Fazendas por estado
'rural-producer.dashboard.crops-distribution' // Distribuição de culturas
'rural-producer.dashboard.land-use'       // Uso de terra
'rural-producer.crop.list'                // Lista de culturas
'rural-producer.harvest-season.list'      // Lista de safras
```

#### Comandos/Queries de Usuários
```typescript
'user.create'          // Criar usuário
'user.update'          // Atualizar usuário
'user.get'             // Buscar por ID
'user.get-by-email'    // Buscar por email
'user.list'            // Listar usuários
'user.validate'        // Validar credenciais
```

### Exemplo de Fluxo Completo

```
1. POST /api/v1/rural/producer
   ↓
2. API Gateway valida JWT e DTO
   ↓
3. NATS publish → 'rural-producer.create'
   {
     taxId: "12345678901",
     taxIdType: "CPF",
     name: "João Silva"
   }
   ↓
4. Core Service (@MessagePattern) → CreateRuralProducerConsumer
   ↓
5. Command Handler → CreateRuralProducerCommandHandler
   ↓
6. Domain Logic → validações de negócio
   ↓
7. Repository (Prisma) → salva no PostgreSQL
   ↓
8. NATS reply ←
   {
     processId: "uuid-1234",
     accepted: true,
     message: "Command accepted for processing"
   }
   ↓
9. HTTP 202 Accepted ← API Gateway retorna ao cliente
```

---

## 🐳 Docker

Ambiente de desenvolvimento containerizado com Docker Compose.

### Serviços

#### PostgreSQL
- **Imagem:** `postgres:16-alpine`
- **Porta:** 5432
- **Database:** agritec
- **Volume persistente:** postgres_data
- **Health check:** pg_isready

#### NATS Server
- **Imagem:** `nats:2-alpine`
- **Portas:** 
  - 4222 (client connections)
  - 8222 (HTTP monitoring)
- **Health check:** HTTP endpoint /healthz

### Comandos

```bash
# Subir dependências
docker-compose up -d

# Verificar status
docker-compose ps

# Logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 20
- Docker & Docker Compose

### 1. Subir Infraestrutura
```bash
docker-compose up -d
```

### 2. Core Service

```bash
cd core-service
npm install

# Executar migrations
npx prisma migrate dev

# Iniciar serviço (porta 3005)
npm run start:dev
```

**Acessar documentações:**
- Swagger: http://localhost:3005/api
- AsyncAPI JSON: http://localhost:3005/asyncapi-json
- AsyncAPI YAML: http://localhost:3005/asyncapi-yaml

### 3. API Gateway

```bash
cd api-gateway
npm install

# Iniciar serviço (porta 3000)
npm run start:dev
```

**Acessar documentação:**
- Swagger UI: http://localhost:3000/api/v1/docs

### 4. Testar Aplicação

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@agritec.com", "password": "senha123"}'

# 2. Login (obter JWT)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@agritec.com", "password": "senha123"}'

# 3. Usar token nas próximas requisições
curl -X POST http://localhost:3000/api/v1/rural/producer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"taxId": "12345678901", "taxIdType": "CPF", "name": "João Silva"}'
```

---

## 📚 Documentação das APIs

### API Gateway
- **Base URL:** http://localhost:3000/api/v1
- **Swagger:** http://localhost:3000/api/v1/docs
- **Autenticação:** Bearer JWT (Header: `Authorization: Bearer <token>`)

### Core Service
- **Base URL:** http://localhost:3005
- **Swagger (REST):** http://localhost:3005/api
- **AsyncAPI (Events):** http://localhost:3005/asyncapi-json

---

## 🧪 Testes

### API Gateway
```bash
cd api-gateway
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

### Core Service
```bash
cd core-service
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

---

## 📁 Estrutura de Pastas

```
agritec/
├── api-gateway/          # API REST pública
│   ├── src/
│   │   ├── auth/         # Autenticação JWT
│   │   ├── controllers/  # REST Controllers
│   │   ├── services/     # Business logic (orquestração)
│   │   └── messaging/    # NATS client (publisher)
│   └── test/
│
├── core-service/         # Microserviço de domínio
│   ├── src/
│   │   ├── modules/
│   │   │   ├── rural-producer/  # Domínio de produtores
│   │   │   ├── users/           # Domínio de usuários
│   │   │   └── other/           # Dados de referência
│   │   └── shared/       # Serviços compartilhados (Prisma, logging)
│   ├── prisma/           # Schema e migrations
│   └── tests/
│
└── docker-compose.yml    # Infraestrutura (PostgreSQL + NATS)
```

---

## 🛠️ Tecnologias Utilizadas

- **Backend Framework:** NestJS
- **Linguagem:** TypeScript
- **Mensageria:** NATS
- **Banco de Dados:** PostgreSQL 16
- **ORM:** Prisma
- **Autenticação:** JWT (Passport)
- **Validação:** class-validator
- **Documentação:** Swagger/OpenAPI, AsyncAPI
- **Containerização:** Docker & Docker Compose

---

## 📝 Convenções

- **Commands:** Operações que modificam estado (assíncronas, retornam HTTP 202)
- **Queries:** Operações de leitura (síncronas, retornam dados imediatamente)
- **DTOs:** Validação em todas as camadas (REST e NATS)
- **Error handling:** Global exception filters em ambos os serviços
- **Logging:** Interceptors para todas as requisições HTTP e mensagens NATS
