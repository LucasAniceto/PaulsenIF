# Guia de Testes OpenFinance

Este documento descreve como testar o sistema OpenFinance implementado.

## Pré-requisitos

1. MongoDB rodando localmente em `mongodb://localhost:27017`
2. Servidor da API rodando em `http://localhost:3000`
3. Um cliente HTTP como `curl`, `Postman`, ou `Insomnia`

## Fluxo Completo de Teste

### 1. Criar um Cliente

**Endpoint:** `POST /customers`

```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "123.456.789-09",
    "email": "joao@example.com"
  }'
```

**Resposta esperada (201):**
```json
{
  "_id": "cus_001",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com",
  "accounts": []
}
```

**Salve o `customerId` (ex: `cus_001`) para os próximos passos.**

---

### 2. Criar uma Conta

**Endpoint:** `POST /accounts`

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checking",
    "branch": "0001",
    "number": "123456",
    "customerId": "cus_001"
  }'
```

**Resposta esperada (201):**
```json
{
  "_id": "acc_001",
  "type": "checking",
  "branch": "0001",
  "number": "123456",
  "balance": 0,
  "customerId": "cus_001",
  "transactions": []
}
```

**Salve o `accountId` (ex: `acc_001`) para os próximos passos.**

---

### 3. Criar uma Transação (Depósito)

**Endpoint:** `POST /transactions`

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Depósito inicial",
    "amount": 1000,
    "type": "credit",
    "category": "deposit",
    "accountId": "acc_001"
  }'
```

**Resposta esperada (201):**
```json
{
  "_id": "txn_001",
  "date": "2025-11-11T12:30:45.123Z",
  "description": "Depósito inicial",
  "amount": 1000,
  "type": "credit",
  "category": "deposit",
  "accountId": "acc_001"
}
```

---

### 4. Buscar Cliente por CPF (Integração)

**Endpoint:** `GET /openfinance/customers/lookup/by-cpf/:cpf`

Esta rota é **pública** (sem necessidade de consentimento).

```bash
curl http://localhost:3000/openfinance/customers/lookup/by-cpf/12345678909
```

**Resposta esperada (200):**
```json
{
  "_id": "cus_001",
  "cpf": "12345678909"
}
```

---

### 5. Criar Consentimento

**Endpoint:** `POST /openfinance/consents`

Esta rota é **pública** e auto-autoriza o consentimento.

```bash
curl -X POST http://localhost:3000/openfinance/consents \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_001",
    "permissions": [
      "ACCOUNTS_READ",
      "CUSTOMER_DATA_READ",
      "BALANCES_READ",
      "TRANSACTIONS_READ"
    ]
  }'
```

**Resposta esperada (201):**
```json
{
  "_id": "cst_1731335445123_abc123def",
  "customerId": "cus_001",
  "permissions": [
    "ACCOUNTS_READ",
    "CUSTOMER_DATA_READ",
    "BALANCES_READ",
    "TRANSACTIONS_READ"
  ],
  "status": "AUTHORIZED",
  "createdAt": "2025-11-11T15:30:45.123Z",
  "expiresAt": "2026-11-11T15:30:45.123Z"
}
```

**Salve o `consentId` (ex: `cst_1731335445123_abc123def`) para revogar later.**

---

### 6. Obter Dados do Cliente (Protegido)

**Endpoint:** `GET /openfinance/customers/:customerId`

Requer permissão: `CUSTOMER_DATA_READ`

```bash
curl http://localhost:3000/openfinance/customers/cus_001
```

**Resposta esperada (200):**
```json
{
  "_id": "cus_001",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com"
}
```

**Teste sem consentimento (deve retornar 403):**

Primeiro, revogue o consentimento (passo abaixo), depois tente acessar:

```bash
curl http://localhost:3000/openfinance/customers/cus_001
```

**Resposta esperada (403):**
```json
{
  "error": "Consentimento não autorizado ou expirado"
}
```

---

### 7. Listar Contas do Cliente (Protegido)

**Endpoint:** `GET /openfinance/customers/:customerId/accounts`

Requer permissão: `ACCOUNTS_READ`

```bash
curl http://localhost:3000/openfinance/customers/cus_001/accounts
```

**Resposta esperada (200):**
```json
{
  "customerId": "cus_001",
  "accounts": [
    {
      "_id": "acc_001",
      "type": "checking",
      "branch": "0001",
      "number": "123456",
      "balance": 1000
    }
  ]
}
```

---

### 8. Obter Saldo da Conta (Protegido)

**Endpoint:** `GET /openfinance/accounts/:accountId/balance`

Requer permissão: `BALANCES_READ`

```bash
curl http://localhost:3000/openfinance/accounts/acc_001/balance
```

**Resposta esperada (200):**
```json
{
  "accountId": "acc_001",
  "balance": 1000
}
```

---

### 9. Listar Transações da Conta (Protegido)

**Endpoint:** `GET /openfinance/transactions/:accountId`

Requer permissão: `TRANSACTIONS_READ`

```bash
curl http://localhost:3000/openfinance/transactions/acc_001
```

**Resposta esperada (200):**
```json
{
  "accountId": "acc_001",
  "transactions": [
    {
      "_id": "txn_001",
      "date": "2025-11-11T12:30:45.123Z",
      "description": "Depósito inicial",
      "amount": 1000,
      "type": "credit",
      "category": "deposit"
    }
  ]
}
```

---

### 10. Consultar Consentimento

**Endpoint:** `GET /openfinance/consents/:id`

```bash
curl http://localhost:3000/openfinance/consents/cst_1731335445123_abc123def
```

**Resposta esperada (200):**
```json
{
  "_id": "cst_1731335445123_abc123def",
  "customerId": "cus_001",
  "permissions": [
    "ACCOUNTS_READ",
    "CUSTOMER_DATA_READ",
    "BALANCES_READ",
    "TRANSACTIONS_READ"
  ],
  "status": "AUTHORIZED",
  "createdAt": "2025-11-11T15:30:45.123Z",
  "expiresAt": "2026-11-11T15:30:45.123Z"
}
```

---

### 11. Revogar Consentimento

**Endpoint:** `DELETE /openfinance/consents/:id`

```bash
curl -X DELETE http://localhost:3000/openfinance/consents/cst_1731335445123_abc123def
```

**Resposta esperada (200):**
```json
{
  "message": "Consentimento revogado com sucesso",
  "consent": {
    "_id": "cst_1731335445123_abc123def",
    "customerId": "cus_001",
    "permissions": [...],
    "status": "REVOKED",
    "createdAt": "2025-11-11T15:30:45.123Z",
    "expiresAt": "2026-11-11T15:30:45.123Z"
  }
}
```

---

### 12. Testar Acesso sem Consentimento

Após revogar o consentimento, tente acessar uma rota protegida:

```bash
curl http://localhost:3000/openfinance/customers/cus_001/accounts
```

**Resposta esperada (403):**
```json
{
  "error": "Consentimento não autorizado ou expirado"
}
```

---

## Cenários de Teste

### Cenário 1: Fluxo Completo Bem-Sucedido

1. Criar cliente
2. Criar conta
3. Criar transação
4. Criar consentimento com todas as permissões
5. Acessar todos os endpoints protegidos
6. Verificar que todas as respostas retornam dados corretos

### Cenário 2: Acesso sem Consentimento

1. Criar cliente
2. Tentar acessar `GET /openfinance/customers/:customerId` sem consentimento
3. Verificar que retorna 403 Forbidden

### Cenário 3: Consentimento Revogado

1. Criar cliente
2. Criar consentimento
3. Verificar acesso com consentimento ativo (200)
4. Revogar consentimento
5. Verificar que retorna 403 Forbidden após revogação

### Cenário 4: Permissões Insuficientes

1. Criar cliente
2. Criar consentimento com apenas `CUSTOMER_DATA_READ`
3. Tentar acessar `GET /openfinance/customers/:customerId` (deve funcionar - 200)
4. Tentar acessar `GET /openfinance/customers/:customerId/accounts` (deve retornar 403 - permissão insuficiente)

### Cenário 5: Lookup por CPF (Integração)

1. Criar cliente com CPF `123.456.789-09`
2. Chamar `GET /openfinance/customers/lookup/by-cpf/123.456.789-09` sem consentimento
3. Verificar que retorna customerId e CPF sem exigir consentimento

---

## Estrutura de Dados

### Modelo Consent

```javascript
{
  _id: String,                    // cst_<timestamp>_<random>
  customerId: String,             // Referência ao Customer
  permissions: [String],          // Array de permissões
  status: String,                 // 'AUTHORIZED', 'PENDING', 'REJECTED', 'REVOKED'
  createdAt: Date,                // Data de criação
  expiresAt: Date                 // Data de expiração (1 ano por padrão)
}
```

### Permissões Disponíveis

- `ACCOUNTS_READ` - Listar contas do cliente
- `CUSTOMER_DATA_READ` - Obter dados do cliente
- `BALANCES_READ` - Obter saldo da conta
- `TRANSACTIONS_READ` - Listar transações da conta

---

## Notas Importantes

1. **Lookup por CPF é público**: A rota `GET /openfinance/customers/lookup/by-cpf/:cpf` não requer consentimento, pois é usada para integração.

2. **Consentimento auto-autorizado**: Ao criar um consentimento via `POST /openfinance/consents`, o status é automaticamente definido como `AUTHORIZED` e a expiração é 1 ano à frente.

3. **Validação de customerId**: Todas as rotas protegidas validam se o cliente existe antes de verificar o consentimento.

4. **Formato de Data**: As datas são retornadas em ISO 8601 (UTC).

5. **Índices**: O modelo Consent possui índices em `customerId`, `status` e `expiresAt` para otimizar buscas.

---

## Troubleshooting

### Erro: "MongoDB conectado com sucesso!" não aparece

- Verifique se o MongoDB está rodando: `mongod --version`
- Verifique a URI em `.env`: `mongodb://localhost:27017/fiapi`
- Tente conectar com `mongo mongodb://localhost:27017/fiapi`

### Erro: "customerId é obrigatório na rota"

- Verifique se a URL contém o `customerId` nos parâmetros
- Exemplo correto: `/openfinance/customers/cus_001/accounts`

### Erro: "Consentimento não autorizado ou expirado"

- Verifique se o consentimento foi criado com status `AUTHORIZED`
- Verifique se a data de expiração ainda não passou
- Crie um novo consentimento se necessário

### Erro: "Cliente não encontrado"

- Verifique se o `customerId` existe no banco de dados
- Crie um novo cliente e use seu ID

---

## Resumo das Rotas

| Método | Rota | Proteção | Permissão Requerida |
|--------|------|----------|---------------------|
| POST | `/openfinance/consents` | Não | - |
| GET | `/openfinance/consents/:id` | Não | - |
| DELETE | `/openfinance/consents/:id` | Não | - |
| GET | `/openfinance/customers/lookup/by-cpf/:cpf` | Não | - |
| GET | `/openfinance/customers/:customerId` | Sim | `CUSTOMER_DATA_READ` |
| GET | `/openfinance/customers/:customerId/accounts` | Sim | `ACCOUNTS_READ` |
| GET | `/openfinance/accounts/:accountId/balance` | Sim | `BALANCES_READ` |
| GET | `/openfinance/transactions/:accountId` | Sim | `TRANSACTIONS_READ` |

