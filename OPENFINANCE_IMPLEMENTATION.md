# Implementação OpenFinance - Documentação Técnica

## Resumo da Implementação

Esta documentação detalha a implementação completa do sistema OpenFinance para a API PaulsenIF, com as especificações de consentimento, proteção de dados e integração.

---

## 1. Arquivos Criados/Modificados

### Novos Arquivos

#### 1.1 Modelo Consent (`src/models/Consent.js`)

**Descrição:** Schema MongoDB para armazenar consentimentos de clientes.

**Campos:**
- `_id` (String): Identificador único do consentimento (formato: `cst_<timestamp>_<random>`)
- `customerId` (String): Referência ao cliente (obrigatório)
- `permissions` (Array<String>): Array de permissões concedidas
- `status` (String): Status do consentimento (`AUTHORIZED`, `PENDING`, `REJECTED`, `REVOKED`)
- `createdAt` (Date): Data de criação (padrão: `Date.now()`)
- `expiresAt` (Date): Data de expiração (padrão: 1 ano após criação)

**Índices:**
- `customerId` (para buscar consentimentos por cliente)
- `status` (para filtrar por status)
- `expiresAt` (para verificar expiração)

---

#### 1.2 Controller de Consentimento (`src/controllers/consentController.js`)

**Funções implementadas:**

##### `createConsent(req, res)`
- **Descrição:** Cria um novo consentimento para um cliente
- **Validações:**
  - Verifica se `customerId` foi fornecido
  - Verifica se `permissions` é um array não-vazio
  - Valida se o cliente existe
  - Valida se as permissões são válidas
  - Verifica se já existe um consentimento ativo
- **Status padrão:** `AUTHORIZED`
- **Expiração padrão:** 1 ano a partir da criação
- **Retorno:** 201 com objeto do consentimento criado

##### `getConsent(req, res)`
- **Descrição:** Consulta um consentimento existente
- **Parâmetros:** `id` (consentId)
- **Retorno:** 200 com dados do consentimento ou 404 se não encontrado

##### `revokeConsent(req, res)`
- **Descrição:** Revoga um consentimento existente
- **Parâmetros:** `id` (consentId)
- **Ação:** Muda status para `REVOKED`
- **Retorno:** 200 com mensagem e consentimento atualizado

---

#### 1.3 Middleware de Consentimento (`src/middlewares/consentMiddleware.js`)

**Função:** `validateConsentMiddleware(requiredPermissions = [])`

**Descrição:** Middleware que valida se um cliente possui um consentimento ativo e com permissões suficientes.

**Lógica:**
1. Extrai `customerId` da URL (params)
2. Busca consentimento com status `AUTHORIZED` e não expirado
3. Se não encontrar, retorna 403 Forbidden
4. Se há permissões obrigatórias, verifica se o consentimento as possui
5. Se tudo OK, adiciona `consent` ao objeto `req` e chama `next()`

**Retornos de erro:**
- 400: `customerId` ausente
- 403: Consentimento inválido ou expirado
- 403: Permissões insuficientes
- 500: Erro ao validar consentimento

---

#### 1.4 Rotas OpenFinance (`src/routes/openfinanceRoutes.js`)

**Prefixo global:** `/openfinance`

**Rotas implementadas:**

##### Rotas de Consentimento (Públicas)

| Método | Rota | Função |
|--------|------|--------|
| POST | `/consents` | Criar consentimento |
| GET | `/consents/:id` | Consultar consentimento |
| DELETE | `/consents/:id` | Revogar consentimento |

---

##### Rotas de Busca (Pública)

| Método | Rota | Função | Proteção |
|--------|------|--------|----------|
| GET | `/customers/lookup/by-cpf/:cpf` | Buscar customerId por CPF | Nenhuma |

**Descrição:** Permite que a API Principal (Investic) encontre o `customerId` de um usuário usando o CPF.

**Resposta:**
```json
{
  "_id": "cus_001",
  "cpf": "12345678909"
}
```

---

##### Rotas de Dados (Protegidas)

| Método | Rota | Permissão | Função |
|--------|------|-----------|--------|
| GET | `/customers/:customerId` | `CUSTOMER_DATA_READ` | Obter dados do cliente |
| GET | `/customers/:customerId/accounts` | `ACCOUNTS_READ` | Listar contas do cliente |
| GET | `/accounts/:accountId/balance` | `BALANCES_READ` | Obter saldo da conta |
| GET | `/transactions/:accountId` | `TRANSACTIONS_READ` | Listar transações da conta |

**Proteção:** Todas as rotas possuem middleware de validação de consentimento que:
1. Verifica se existe consentimento ativo
2. Valida se não está expirado
3. Verifica se possui a permissão requerida
4. Retorna 403 se alguma validação falhar

---

### Arquivos Modificados

#### 2.1 Server (`src/server.js`)

**Modificações:**
- Importada rota OpenFinance: `const openfinanceRoutes = require('./routes/openfinanceRoutes');`
- Registrada rota com prefixo: `app.use('/openfinance', openfinanceRoutes);`

---

#### 2.2 Arquivo de Ambiente (`.env`)

**Criado com valores padrão:**
```env
MONGODB_URI=mongodb://localhost:27017/fiapi
PORT=3000
NODE_ENV=development
```

---

## 2. Fluxo de Dados

```
┌─────────────────┐
│  Request HTTP   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│ Verificar se é rota pública          │
│ (/consents, /lookup/by-cpf)         │
└────────┬────────────────────────────┘
         │
         ├─── SIM ──→ Processar sem middleware
         │
         └─── NÃO ──→ Aplicar middleware de consentimento
                      │
                      v
                ┌──────────────────────────────────┐
                │ validateConsentMiddleware        │
                └────┬─────────────────────────────┘
                     │
                     ├─ Extrair customerId
                     ├─ Buscar consentimento no MongoDB
                     ├─ Validar status AUTHORIZED
                     ├─ Validar data de expiração
                     └─ Validar permissões
                     │
                     ├─── VÁLIDO ──→ next()
                     │
                     └─── INVÁLIDO ──→ 403 Forbidden
                                      │
                                      v
                              ┌──────────────────┐
                              │ Response 403     │
                              │ {error: "..."}   │
                              └──────────────────┘
         │
         v
┌─────────────────────────────────────┐
│ Processar requisição no controller  │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│ Buscar dados no MongoDB             │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│ Retornar Response (200/400/404/500) │
└─────────────────────────────────────┘
```

---

## 3. Permissões Disponíveis

| Permissão | Recurso | Descrição |
|-----------|---------|-----------|
| `ACCOUNTS_READ` | Contas | Listar contas do cliente |
| `CUSTOMER_DATA_READ` | Cliente | Acessar dados pessoais do cliente |
| `BALANCES_READ` | Saldo | Obter saldo de contas |
| `TRANSACTIONS_READ` | Transações | Listar transações de contas |

---

## 4. Ciclo de Vida do Consentimento

### Criação
```
POST /openfinance/consents
{
  "customerId": "cus_001",
  "permissions": ["ACCOUNTS_READ", "CUSTOMER_DATA_READ", ...]
}
```

↓

```
Status: AUTHORIZED (automático)
expiresAt: Date.now() + 1 ano
```

### Validação em Cada Requisição
```
Middleware verifica:
├─ exists (consentimento existe?)
├─ status === "AUTHORIZED"
├─ expiresAt > Date.now()
└─ permissions.includes(requiredPermission)
```

### Revogação
```
DELETE /openfinance/consents/:id
```

↓

```
Status: REVOKED
```

---

## 5. Integração com API Principal (Investic)

A rota de lookup foi implementada especificamente para integração:

```
GET /openfinance/customers/lookup/by-cpf/:cpf
```

**Fluxo:**
1. API Principal (Investic) envia CPF do usuário
2. PaulsenIF responde com `customerId`
3. API Principal usa `customerId` para próximas operações
4. Para acessar dados, API Principal cria consentimento
5. API Principal pode acessar dados protegidos com consentimento ativo

**Vantagens:**
- Lookup é público (sem exigir consentimento)
- Consentimento é controlado no PaulsenIF
- Dados sensíveis são protegidos
- Fluxo segue padrão OpenFinance

---

## 6. Referências de Dados

### Estrutura de Referências

```
Customer
├─ _id: "cus_001"
├─ name, cpf, email
└─ accounts: ["acc_001", "acc_002", ...]
   │
   v
Account
├─ _id: "acc_001"
├─ customerId: "cus_001" (REFERÊNCIA)
├─ type, branch, number, balance
└─ transactions: ["txn_001", "txn_002", ...]
   │
   v
Transaction
├─ _id: "txn_001"
├─ accountId: "acc_001" (REFERÊNCIA)
├─ date, description, amount, type, category
```

### Validações
- **Account → Customer**: `customerId` deve existir
- **Transaction → Account**: `accountId` deve existir
- **Consent → Customer**: `customerId` deve existir

---

## 7. Tratamento de Erros

### Status HTTP Utilizados

| Status | Caso de Uso |
|--------|-----------|
| 200 | Sucesso em operações GET, DELETE |
| 201 | Sucesso na criação (POST /consents) |
| 400 | Validação falhou, CPF inválido, permissões inválidas |
| 403 | Consentimento inválido/expirado, permissões insuficientes |
| 404 | Recurso não encontrado (cliente, consentimento, etc.) |
| 500 | Erro interno do servidor |

### Exemplos de Respostas

**Sucesso (GET):**
```json
{
  "_id": "cus_001",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com"
}
```

**Erro 403 - Consentimento Inválido:**
```json
{
  "error": "Consentimento não autorizado ou expirado"
}
```

**Erro 403 - Permissões Insuficientes:**
```json
{
  "error": "Permissões insuficientes. Requeridas: ACCOUNTS_READ"
}
```

**Erro 400 - Validação:**
```json
{
  "error": "Permissões devem ser um array não-vazio"
}
```

---

## 8. Índices de Banco de Dados

### Consent Collection

```javascript
consentSchema.index({ customerId: 1 });
consentSchema.index({ status: 1 });
consentSchema.index({ expiresAt: 1 });
```

**Propósito:**
- `customerId`: Buscar consentimentos de um cliente
- `status`: Filtrar por status (AUTHORIZED, REVOKED)
- `expiresAt`: Verificar expiração eficientemente

---

## 9. Exemplo de Fluxo Completo

### 1. Cliente cria conta
```bash
POST /customers → cus_001
POST /accounts → acc_001 (customerId: cus_001)
POST /transactions → txn_001 (accountId: acc_001)
```

### 2. API Principal descobre customerId
```bash
GET /openfinance/customers/lookup/by-cpf/12345678909 → cus_001
```

### 3. Cliente concede consentimento
```bash
POST /openfinance/consents
{
  "customerId": "cus_001",
  "permissions": ["ACCOUNTS_READ", "BALANCES_READ", "TRANSACTIONS_READ"]
}
→ cst_1731335445123_abc123def (AUTHORIZED, expires 1 ano)
```

### 4. API Principal acessa dados protegidos
```bash
GET /openfinance/customers/cus_001/accounts
→ Lista de contas (middleware valida consentimento)

GET /openfinance/accounts/acc_001/balance
→ Saldo: 1000 (middleware valida consentimento)

GET /openfinance/transactions/acc_001
→ Lista de transações (middleware valida consentimento)
```

### 5. Cliente revoga consentimento
```bash
DELETE /openfinance/consents/cst_1731335445123_abc123def
→ Status: REVOKED
```

### 6. Tentativa de acesso após revogação
```bash
GET /openfinance/customers/cus_001/accounts
→ 403 Forbidden: "Consentimento não autorizado ou expirado"
```

---

## 10. Segurança

### Proteções Implementadas

1. **Validação de Permissões**: Cada rota valida permissões específicas
2. **Expiração de Consentimento**: Consentimentos expiram automaticamente
3. **Revogação Manual**: Clientes podem revogar consentimento a qualquer momento
4. **Validação de Referências**: Verifica existência de clientes antes de acessar
5. **Tratamento de Erros**: Erros específicos sem expor detalhes internos
6. **Índices Otimizados**: Queries eficientes e seguras

### Dados Sensíveis Protegidos

- CPF (protegido por `CUSTOMER_DATA_READ`)
- Email (protegido por `CUSTOMER_DATA_READ`)
- Nome completo (protegido por `CUSTOMER_DATA_READ`)
- Saldo de contas (protegido por `BALANCES_READ`)
- Histórico de transações (protegido por `TRANSACTIONS_READ`)

### Dados Públicos

- Lookup por CPF (para integração) - retorna apenas `_id` e `cpf`

---

## 11. Próximas Melhorias (Opcional)

1. **Auditoria**: Registrar todas as ações de acesso
2. **Rate Limiting**: Limitar requisições por cliente
3. **Logging**: Log de todas as requisições e respostas
4. **Refresh de Consentimento**: Permitir renovação automática
5. **Webhooks**: Notificar sistemas quando consentimento expira
6. **Revocação Automática**: Revocar consentimentos suspeitos
7. **Análise de Risco**: Detectar padrões anormais de acesso
8. **2FA**: Autenticação adicional para operações sensíveis

---

## Conclusão

O sistema OpenFinance foi implementado com:
- ✅ Modelo de dados robusto
- ✅ Middleware de validação de consentimento
- ✅ Rotas protegidas com permissões específicas
- ✅ Integração com lookup por CPF
- ✅ Ciclo de vida completo de consentimento
- ✅ Tratamento de erros consistente
- ✅ Documentação técnica completa

O sistema está pronto para ser testado e integrado com a API Principal (Investic).
