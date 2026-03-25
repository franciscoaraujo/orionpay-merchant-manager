# OrionPay - Portal do Lojista (Frontend Documentation)

Este documento detalha a arquitetura, as funcionalidades e os requisitos de dados do frontend da OrionPay, servindo como guia para o desenvolvimento do ecossistema de backend.

## 🚀 Visão Geral

O Portal do Lojista da OrionPay é uma aplicação Next.js de alta fidelidade voltada para a gestão de transações financeiras, liquidação de recebíveis, gestão de terminais e suporte ao cliente.

***

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Estilização:** Tailwind CSS v4
- **Gerenciamento de Estado:** React Query (TanStack Query)

### Backend (Recomendado)
- **Linguagem:** Java 21+
- **Framework:** Spring Boot 3.x
- **Segurança:** Spring Security + JWT
- **Persistência:** Spring Data JPA (PostgreSQL / Redis para cache)
- **Documentação:** SpringDoc OpenAPI (Swagger)
- **Mensageria:** Spring Cloud Stream (RabbitMQ/Kafka) para Event Sourcing

## 🔐 Configurações de Segurança e CORS (Importante)

Para que o frontend (`http://localhost:3000`) consiga se comunicar com o backend (`http://localhost:8080`), é **obrigatório** configurar o CORS no Spring Boot.

### Opção 1: Configuração Global (Recomendado)

Crie uma classe de configuração no seu projeto Java:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Opção 2: No Controller (Específico)

Adicione a anotação `@CrossOrigin` no seu Controller:

```java
@RestController
@RequestMapping("/api/v1/merchants")
@CrossOrigin(origins = "http://localhost:3000")
public class MerchantController {
    // ... endpoints
}
```

***

## 🏗 Arquitetura de Microserviços e Endpoints

Abaixo estão as definições de URIs e estruturas de dados (JSON) recomendadas para cada serviço.

### 1. Auth Service

**Base URI:** `http://localhost:8080/api/v1/auth` (Local Dev)

| Método | Endpoint      | Descrição                           |
| :----- | :------------ | :---------------------------------- |
| `POST` | `/login`      | Autenticação inicial (E-mail/Senha) |
| `POST` | `/2fa/verify` | Validação de token de segundo fator |
| `POST` | `/refresh`    | Renovação de Access Token           |
| <br /> | <br />        | <br />                              |

**Exemplo de Resposta Login:**

```json
{
  "access_token": "eyJhbG...",
  "user": {
    "id": "usr_123",
    "name": "Admin Orion",
    "email": "admin@orionpay.com.br",
    "role": "OWNER"
  }
}
```

### 2. Merchant Service

**Base URI:** `http://localhost:8080/api/v1/merchants` (Local Dev)

| Método  | Endpoint        | Descrição                             |
| :------ | :-------------- | :------------------------------------ |
| `POST`  | `/onboarding`   | Cadastro de novo lojista (Onboarding) |
| `GET`   | `/{id}`         | Dados cadastrais e bancários          |
| `GET`   | `/{id}/pricing` | Perfil de taxas (Read-only no front)  |
| `PATCH` | `/{id}/configs` | Atualiza aceitação de bandeiras e 2FA |

**Objeto** **`Pricing`:**

```json
{
  "merchant_id": "mer_999",
  "rates": [
    { "brand": "Visa", "product": "DEBIT", "mdr": 1.20, "settlement_days": 1 },
    { "brand": "Visa", "product": "CREDIT_SPOT", "mdr": 2.45, "settlement_days": 30 }
  ]
}
```

### 3. Transaction Service

**Base URI:** `https://api.orionpay.com.br/v1/transactions`

| Método | Endpoint       | Descrição                          |
| :----- | :------------- | :--------------------------------- |
| `GET`  | `/`            | Listagem com filtros e paginação   |
| `GET`  | `/{id}/events` | Trilha de Eventos (Event Sourcing) |

**Objeto** **`TransactionEvent`:**

```json
[
  { "event": "AUTHORIZED", "timestamp": "2026-03-12T10:00:00Z", "actor": "Gateway" },
  { "event": "CAPTURED", "timestamp": "2026-03-12T10:05:00Z", "actor": "Acquirer" },
  { "event": "SETTLED", "timestamp": "2026-03-13T09:00:00Z", "actor": "SettlementEngine" }
]
```

### 4. Settlement & Receivable Service

**Base URI:** `https://api.orionpay.com.br/v1/settlements`

| Método | Endpoint      | Descrição                                    |
| :----- | :------------ | :------------------------------------------- |
| `GET`  | `/agenda`     | Lançamentos futuros e status de titularidade |
| `POST` | `/anticipate` | Solicitação de antecipação                   |

**Objeto** **`SettlementEntry`:**

```json
{
  "id": "set_001",
  "amount_net": 145.20,
  "ownership_status": "LINKED_TO_GUARANTEE",
  "contract_effect": {
    "creditor": "Banco Itaú",
    "type": "DOMICILE_LOCK",
    "registrar": "CERC"
  }
}
```

### 5. Terminal Service

**Base URI:** `https://api.orionpay.com.br/v1/terminals`

| Método  | Endpoint       | Descrição               |
| :------ | :------------- | :---------------------- |
| `GET`   | `/`            | Listagem de hardware    |
| `PATCH` | `/{id}/status` | Ativar/Bloquear máquina |

**Objeto `Terminal`:**
```json
{
  "id": "t_001",
  "serial_number": "SN-123456",
  "model": "Pax A920",
  "status": "ACTIVE",
  "type": "SMART_POS"
}
```

### 6. Audit Service

**Base URI:** `https://api.orionpay.com.br/v1/audit`

| Método | Endpoint | Descrição                         |
| :----- | :------- | :-------------------------------- |
| `GET`  | `/logs`  | Histórico de acessos e alterações |

**Objeto** **`AuditLog`:**

```json
{
  "user": "admin@orionpay.com.br",
  "action": "RATE_CHANGE",
  "diff": { "before": "2.55%", "after": "2.45%" },
  "ip": "189.120.45.2",
  "correlation_id": "req_abc123"
}
```

### 7. Support Service

**Base URI:** `https://api.orionpay.com.br/v1/support`

| Método | Endpoint                 | Descrição                    |
| :----- | :----------------------- | :--------------------------- |
| `GET`  | `/tickets`               | Listagem de chamados         |
| `POST` | `/tickets`               | Criação de novo chamado      |
| `POST` | `/tickets/{id}/messages` | Resposta em ticket existente |

**Objeto `Ticket`:**
```json
{
  "id": "#ORP-1029",
  "subject": "Dúvida sobre Antecipação",
  "status": "ANSWERED",
  "messages": [
    { "sender": "USER", "content": "...", "timestamp": "2026-03-12T09:00:00Z" }
  ]
}
```

***

## 📝 OpenAPI / Swagger Preview (YAML)

```yaml
openapi: 3.0.0
info:
  title: OrionPay Merchant API
  version: 1.0.0
paths:
  /v1/auth/login:
    post:
      summary: Authenticate merchant user
      responses:
        '200':
          description: OK
  /v1/settlements/agenda:
    get:
      summary: Get financial agenda with contract effects
      responses:
        '200':
          description: List of receivables
```

***

## 🔒 Segurança e Compliance

- **Spring Security (CORS):** É obrigatório configurar o CORS no backend para permitir requisições da origem do frontend (`http://localhost:3000`).
  
**Exemplo de Configuração no Spring Boot:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

- **Spring Security (JWT):** Implementar filtros para validação de JWT.
- **PCI DSS:** O frontend já realiza o mascaramento de dados. O backend deve garantir que dados sensíveis nunca trafeguem em texto aberto.
- **Headers Mandatórios:** `X-Correlation-ID` (rastreabilidade) e `Authorization: Bearer <token>`.
- **Exception Handling:** Utilizar `@ControllerAdvice` para padronizar erros da API seguindo o RFC 7807 (Problem Details).

***

*Documentação atualizada em 14/03/2026 para a equipe de Backend da OrionPay.*
