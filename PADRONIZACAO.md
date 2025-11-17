# 📋 Padronização de Rotas e Endpoints

## Análise de Diferenças

Sua API está funcionando corretamente. A única mudança necessária é **reorganizar as rotas para seguir o padrão de instituições financeiras conectadas**.

### 🎯 Objetivo
Todas as rotas devem estar sob o prefixo `/openfinance` para padronização entre múltiplas instituições financeiras fictícias.

---

## Mudanças Necessárias

### ❌ Atual (Seu Projeto)

```
POST   /customers                     (sem prefixo)
POST   /accounts                      (sem prefixo)
POST   /transactions                  (sem prefixo)
GET    /                              (sem prefixo)
POST   /openfinance/consents          (com prefixo)
GET    /openfinance/consents/:id
DELETE /openfinance/consents/:id
GET    /openfinance/customers/lookup/by-cpf/:cpf
GET    /openfinance/customers/:customerId
GET    /openfinance/customers/:customerId/accounts
GET    /openfinance/accounts/:accountId/balance
GET    /openfinance/transactions/:accountId
```

### ✅ Padronizado (Padrão)

```
GET    /openfinance/                 (status/info)
POST   /openfinance/customers        (mover aqui)
POST   /openfinance/accounts         (mover aqui)
POST   /openfinance/transactions     (mover aqui)
POST   /openfinance/consents         (já está)
GET    /openfinance/consents/:consentId
DELETE /openfinance/consents/:consentId
GET    /openfinance/customers/lookup/by-cpf/:cpf
GET    /openfinance/customers/:customerId
GET    /openfinance/customers/:customerId/accounts
GET    /openfinance/accounts/:accountId/balance
GET    /openfinance/transactions/:accountId
```

---

## Implementação

### Passo 1: Consolidar Rotas em um Único Arquivo

Mover todas as rotas (customers, accounts, transactions) para o arquivo `src/routes/openfinanceRoutes.js`.

**Arquivo atual:** `src/routes/openfinanceRoutes.js`

Ele já contém as rotas protegidas. Precisamos adicionar as rotas públicas de criação.

### Passo 2: Atualizar server.js

```javascript
// ATUAL
app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);
app.use('/openfinance', openfinanceRoutes);

// PADRONIZADO
app.use('/openfinance', openfinanceRoutes);
```

### Passo 3: Endpoint de Status

Adicionar rota `GET /openfinance/` que retorna informações da API.

---

## Estrutura de Rotas Consolidadas

### Rotas Públicas (Criação)

```javascript
// GET /openfinance/ - Status e informações da API
router.get('/', (req, res) => {
  res.json({
    message: "API da Instituição Financeira",
    version: "2.0.0",
    status: "online",
    endpoints: {
      open: [
        "GET /openfinance/",
        "POST /openfinance/customers",
        "POST /openfinance/accounts",
        "POST /openfinance/transactions"
      ],
      consent: [
        "POST /openfinance/consents",
        "GET /openfinance/consents/:consentId",
        "DELETE /openfinance/consents/:consentId"
      ],
      protected: [
        "GET /openfinance/customers/:customerId",
        "GET /openfinance/customers/:customerId/accounts",
        "GET /openfinance/accounts/:accountId/balance",
        "GET /openfinance/transactions/:accountId"
      ]
    }
  });
});

// POST /openfinance/customers - Criar cliente
router.post('/customers', createCustomer);

// POST /openfinance/accounts - Criar conta
router.post('/accounts', createAccount);

// POST /openfinance/transactions - Criar transação
router.post('/transactions', createTransaction);
```

### Rotas de Consentimento

```javascript
// POST /openfinance/consents - Criar consentimento
router.post('/consents', createConsent);

// GET /openfinance/consents/:consentId - Obter consentimento
router.get('/consents/:consentId', getConsent);

// DELETE /openfinance/consents/:consentId - Revogar consentimento
router.delete('/consents/:consentId', revokeConsent);
```

### Rotas de Busca (Integração)

```javascript
// GET /openfinance/customers/lookup/by-cpf/:cpf - Buscar por CPF
router.get('/customers/lookup/by-cpf/:cpf', getCustomerByCpf);
```

### Rotas Protegidas

```javascript
// GET /openfinance/customers/:customerId - Obter dados do cliente
router.get('/customers/:customerId', validateConsent('CUSTOMER_DATA_READ'), getCustomerData);

// GET /openfinance/customers/:customerId/accounts - Listar contas
router.get('/customers/:customerId/accounts', validateConsent('ACCOUNTS_READ'), getCustomerAccounts);

// GET /openfinance/accounts/:accountId/balance - Obter saldo
router.get('/accounts/:accountId/balance', validateConsent('BALANCES_READ'), getBalance);

// GET /openfinance/transactions/:accountId - Listar transações
router.get('/transactions/:accountId', validateConsent('TRANSACTIONS_READ'), getTransactions);
```

---

## Ordem de Importações em openfinanceRoutes.js

```javascript
const express = require('express');

// Controllers
const { createCustomer } = require('../controllers/customerController');
const { createAccount } = require('../controllers/accountController');
const { createTransaction } = require('../controllers/transactionController');
const { createConsent, getConsent, revokeConsent } = require('../controllers/consentController');

// Middlewares
const { validateConsentMiddleware } = require('../middlewares/consentMiddleware');

// Models
const Account = require('../models/Account');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ... routes aqui
```

---

## Mudanças em server.js

**Remover:**
```javascript
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);
```

**Manter:**
```javascript
const openfinanceRoutes = require('./routes/openfinanceRoutes');
app.use('/openfinance', openfinanceRoutes);
```

---

## Benefícios da Padronização

✅ **Consistência** - Todas as rotas seguem o mesmo padrão
✅ **Integração** - Fácil conectar múltiplas instituições financeiras
✅ **Manutenção** - Rotas em um único arquivo (openfinanceRoutes.js)
✅ **API Gateway** - Simples usar um API Gateway ou proxy que redireciona para `/openfinance`
✅ **Versionamento** - Futuro: `/openfinance/v2/...`

---

## Checklist de Implementação

- [ ] Consolidar todas as rotas em `src/routes/openfinanceRoutes.js`
- [ ] Adicionar rota `GET /openfinance/` com status
- [ ] Importar todos os controllers necessários em openfinanceRoutes.js
- [ ] Remover importações de rotas antigas do server.js
- [ ] Manter apenas `app.use('/openfinance', openfinanceRoutes)`
- [ ] Testar todas as rotas com novo prefixo
- [ ] Atualizar documentação (README, TEST_GUIDE, etc)

---

## Exemplos de Requisições Após Padronização

```bash
# Status
curl http://localhost:3000/openfinance/

# Criar cliente
curl -X POST http://localhost:3000/openfinance/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"João","cpf":"123.456.789-09","email":"joao@example.com"}'

# Criar conta
curl -X POST http://localhost:3000/openfinance/accounts \
  -H "Content-Type: application/json" \
  -d '{"type":"checking","branch":"0001","number":"123456","customerId":"cus_001"}'

# Criar transação
curl -X POST http://localhost:3000/openfinance/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Depósito","amount":1000,"type":"credit","category":"deposit","accountId":"acc_001"}'

# Criar consentimento
curl -X POST http://localhost:3000/openfinance/consents \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_001","permissions":["ACCOUNTS_READ","CUSTOMER_DATA_READ"]}'

# Acessar dados protegidos
curl http://localhost:3000/openfinance/customers/cus_001/accounts
```

---

## Manter Compatível

Os controllers e models **NÃO precisam mudar**. Apenas a estrutura de rotas é reorganizada.

A lógica interna continua exatamente igual:
- ✅ Como gera IDs (sequencial no banco)
- ✅ Como valida dados (CPF, email, etc)
- ✅ Como funciona o middleware de consentimento
- ✅ Como persiste dados no MongoDB

