# 🏦 FI API - Instituição Financeira

API REST para gerenciamento de instituição financeira construída com Node.js, Express e MongoDB.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Endpoints](#endpoints)
- [OpenFinance](#openfinance)
- [Validações](#validações)
- [Scripts Utilitários](#scripts-utilitários)
- [Estrutura do Projeto](#estrutura-do-projeto)

## ✨ Características

- ✅ **Gestão de Clientes** - Cadastro com validação completa de CPF
- ✅ **Gestão de Contas** - Contas corrente e poupança
- ✅ **Transações Financeiras** - Crédito e débito com controle de saldo
- ✅ **IDs Sequenciais** - Sistema thread-safe para geração de IDs únicos
- ✅ **Validações Robustas** - CPF, email e dados obrigatórios
- ✅ **Índices Otimizados** - Performance otimizada para consultas
- ✅ **OpenFinance** - Sistema de consentimento com permissões granulares
- ✅ **Middleware de Proteção** - Validação de consentimento em rotas protegidas
- ✅ **Integração** - Lookup por CPF para APIs externas

## 🛠 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **dotenv** - Gerenciamento de variáveis de ambiente

## 🚀 Instalação

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd FIapi
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
MONGODB_URI=mongodb://localhost:27017/fiapi
PORT=3000
NODE_ENV=development
```

### Iniciando o servidor

```bash
npm start
# ou para desenvolvimento
npm run dev
```

Servidor rodará em: `http://localhost:3000`

## 📖 Uso

### Endpoint Base
```
GET /
```

**Resposta:**
```json
{
  "message": "API da Instituição Financeira",
  "version": "1.0.0",
  "status": "ativo",
  "endpoints": {
    "customers": "POST /customers",
    "accounts": "POST /accounts, GET /accounts/:id/balance",
    "transactions": "POST /transactions, GET /transactions/:accountId"
  }
}
```

## 🔗 Endpoints

### 👥 Clientes

#### Criar Cliente
```http
POST /customers
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com"
}
```

**Resposta (201):**
```json
{
  "_id": "cus_001",
  "name": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "accounts": []
}
```

### 💳 Contas

#### Criar Conta
```http
POST /accounts
Content-Type: application/json

{
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "customerId": "cus_001"
}
```

**Resposta (201):**
```json
{
  "_id": "acc_001",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "balance": 0,
  "customerId": "cus_001",
  "transactions": []
}
```

#### Consultar Saldo
```http
GET /accounts/acc_001/balance
```

**Resposta (200):**
```json
{
  "accountId": "acc_001",
  "balance": 1500.50
}
```

### 💰 Transações

#### Criar Transação
```http
POST /transactions
Content-Type: application/json

{
  "description": "Depósito inicial",
  "amount": 1000.00,
  "type": "credit",
  "category": "deposito",
  "accountId": "acc_001"
}
```

**Resposta (201):**
```json
{
  "_id": "txn_001",
  "date": "2024-01-15T10:30:00.000Z",
  "description": "Depósito inicial",
  "amount": 1000.00,
  "type": "credit",
  "category": "deposito",
  "accountId": "acc_001"
}
```

## 🔐 OpenFinance

### Sistema de Consentimento

A API implementa um sistema completo de consentimento seguindo padrões OpenFinance, com suporte a permissões granulares e middleware de proteção.

#### Permissões Disponíveis

- **ACCOUNTS_READ** - Listar contas do cliente
- **CUSTOMER_DATA_READ** - Acessar dados pessoais do cliente
- **BALANCES_READ** - Obter saldo de contas
- **TRANSACTIONS_READ** - Listar transações de contas

### Rotas OpenFinance (Prefixo: `/openfinance`)

#### Criar Consentimento (Público)
```http
POST /openfinance/consents
Content-Type: application/json

{
  "customerId": "cus_001",
  "permissions": [
    "ACCOUNTS_READ",
    "CUSTOMER_DATA_READ",
    "BALANCES_READ",
    "TRANSACTIONS_READ"
  ]
}
```

**Resposta (201):**
```json
{
  "_id": "cst_1731335445123_abc123def",
  "customerId": "cus_001",
  "permissions": ["ACCOUNTS_READ", "CUSTOMER_DATA_READ", "BALANCES_READ", "TRANSACTIONS_READ"],
  "status": "AUTHORIZED",
  "createdAt": "2025-11-11T15:30:45.123Z",
  "expiresAt": "2026-11-11T15:30:45.123Z"
}
```

#### Buscar Cliente por CPF (Público - Integração)
```http
GET /openfinance/customers/lookup/by-cpf/12345678909
```

**Resposta (200):**
```json
{
  "_id": "cus_001",
  "cpf": "12345678909"
}
```

#### Obter Dados do Cliente (Protegido)
```http
GET /openfinance/customers/cus_001
```

Requer: `CUSTOMER_DATA_READ`

**Resposta (200):**
```json
{
  "_id": "cus_001",
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com"
}
```

#### Listar Contas do Cliente (Protegido)
```http
GET /openfinance/customers/cus_001/accounts
```

Requer: `ACCOUNTS_READ`

**Resposta (200):**
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

#### Obter Saldo da Conta (Protegido)
```http
GET /openfinance/accounts/acc_001/balance
```

Requer: `BALANCES_READ`

**Resposta (200):**
```json
{
  "accountId": "acc_001",
  "balance": 1000
}
```

#### Listar Transações (Protegido)
```http
GET /openfinance/transactions/acc_001
```

Requer: `TRANSACTIONS_READ`

**Resposta (200):**
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

#### Consultar Consentimento (Público)
```http
GET /openfinance/consents/cst_1731335445123_abc123def
```

**Resposta (200):**
```json
{
  "_id": "cst_1731335445123_abc123def",
  "customerId": "cus_001",
  "permissions": ["ACCOUNTS_READ", "CUSTOMER_DATA_READ"],
  "status": "AUTHORIZED",
  "createdAt": "2025-11-11T15:30:45.123Z",
  "expiresAt": "2026-11-11T15:30:45.123Z"
}
```

#### Revogar Consentimento (Público)
```http
DELETE /openfinance/consents/cst_1731335445123_abc123def
```

**Resposta (200):**
```json
{
  "message": "Consentimento revogado com sucesso",
  "consent": { ... }
}
```

### Fluxo de Integração

1. **Lookup por CPF** - API Externa busca cliente (público, sem consentimento)
2. **Criar Consentimento** - Cliente autoriza acesso
3. **Acessar Dados** - Middleware valida consentimento em cada requisição
4. **Revogar** - Cliente pode revogar acesso a qualquer momento

### Middleware de Proteção

Todas as rotas protegidas validam automaticamente:
- ✅ Consentimento existe e está AUTHORIZED
- ✅ Consentimento não está expirado
- ✅ Cliente possui permissão requerida
- ✅ Retorna 403 Forbidden se alguma validação falhar

## ✅ Validações

### 👤 Cliente
- **Nome:** 2-100 caracteres, apenas letras e espaços
- **CPF:** Validação com algoritmo oficial da Receita Federal
- **Email:** Formato válido, único no sistema

### 💳 Conta
- **Tipo:** `checking` (corrente) ou `savings` (poupança)
- **Agência + Número:** Combinação única
- **Cliente:** Deve existir no sistema

### 💰 Transação
- **Valor:** Maior que 0, máximo 999.999.999,99
- **Tipo:** `credit` (crédito) ou `debit` (débito)
- **Saldo:** Verificação automática para débitos

### 🔢 Sistema de IDs

Os IDs são gerados sequencialmente:
- **Clientes:** `cus_001`, `cus_002`, `cus_003`...
- **Contas:** `acc_001`, `acc_002`, `acc_003`...
- **Transações:** `txn_001`, `txn_002`, `txn_003`...

## 🧹 Scripts Utilitários

### Limpar Banco de Dados
```bash
node scripts/clearDatabase.js
```

**O que faz:**
- Remove todas as collections
- Reseta contadores de ID
- Prepara sistema para testes limpos

## 📁 Estrutura do Projeto

```
PaulsenIF/
├── src/
│   ├── config/
│   │   └── database.js               # Configuração MongoDB
│   ├── controllers/
│   │   ├── accountController.js      # Lógica de contas
│   │   ├── consentController.js      # Lógica de consentimento
│   │   ├── customerController.js     # Lógica de clientes
│   │   └── transactionController.js  # Lógica de transações
│   ├── middlewares/
│   │   └── consentMiddleware.js      # Middleware de validação de consentimento
│   ├── models/
│   │   ├── Account.js                # Schema de conta
│   │   ├── Consent.js                # Schema de consentimento
│   │   ├── Counter.js                # Schema para IDs sequenciais
│   │   ├── Customer.js               # Schema de cliente
│   │   └── Transaction.js            # Schema de transação
│   ├── routes/
│   │   ├── accountRoutes.js          # Rotas de contas
│   │   ├── customerRoutes.js         # Rotas de clientes
│   │   ├── openfinanceRoutes.js      # Rotas OpenFinance
│   │   └── transactionRoutes.js      # Rotas de transações
│   ├── utils/
│   │   ├── cpfValidator.js           # Validador de CPF
│   │   └── idGenerator.js            # Gerador de IDs sequenciais
│   └── server.js                     # Servidor principal
├── scripts/
│   └── clearDatabase.js              # Script para limpar BD
├── .env                              # Variáveis de ambiente
├── .gitignore
├── package.json
├── README.md
├── OPENFINANCE_SUMMARY.md            # Resumo da implementação OpenFinance
├── OPENFINANCE_IMPLEMENTATION.md     # Documentação técnica detalhada
└── OPENFINANCE_TEST_GUIDE.md         # Guia de testes com exemplos
```

## 🧪 Testando a API

### Teste Básico (Operações Normais)

#### 1. Limpe o banco
```bash
node scripts/clearDatabase.js
```

#### 2. Crie um cliente
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "cpf": "11144477735",
    "email": "maria@email.com"
  }'
```

#### 3. Crie uma conta
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checking",
    "branch": "0001",
    "number": "12345-6",
    "customerId": "cus_001"
  }'
```

#### 4. Faça uma transação
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Depósito inicial",
    "amount": 1500.00,
    "type": "credit",
    "category": "deposito",
    "accountId": "acc_001"
  }'
```

### Teste OpenFinance (Consentimento e Proteção)

#### 1. Buscar cliente por CPF (público)
```bash
curl http://localhost:3000/openfinance/customers/lookup/by-cpf/11144477735
```

#### 2. Criar consentimento
```bash
curl -X POST http://localhost:3000/openfinance/consents \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_001",
    "permissions": ["ACCOUNTS_READ", "CUSTOMER_DATA_READ", "BALANCES_READ", "TRANSACTIONS_READ"]
  }'
```

#### 3. Acessar dados protegidos (com consentimento)
```bash
curl http://localhost:3000/openfinance/customers/cus_001/accounts
curl http://localhost:3000/openfinance/accounts/acc_001/balance
curl http://localhost:3000/openfinance/transactions/acc_001
```

#### 4. Revogar consentimento
```bash
curl -X DELETE http://localhost:3000/openfinance/consents/cst_xxx
```

#### 5. Tentar acessar sem consentimento (deve falhar com 403)
```bash
curl http://localhost:3000/openfinance/customers/cus_001/accounts
```

### Documentação Completa de Testes

Para um guia completo com todos os cenários de teste, veja:
- [OPENFINANCE_TEST_GUIDE.md](OPENFINANCE_TEST_GUIDE.md) - Exemplos detalhados de todas as requisições

## ⚠️ Códigos de Erro

- **400** - Dados inválidos ou ausentes
- **404** - Recurso não encontrado
- **500** - Erro interno do servidor

## 📝 Exemplos de Erro

### CPF Inválido
```json
{
  "error": "CPF inválido"
}
```

### Saldo Insuficiente
```json
{
  "error": "Saldo insuficiente"
}
```

### Cliente Não Encontrado
```json
{
  "error": "Cliente não encontrado"
}
```

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Se o MongoDB está rodando
2. Se as variáveis de ambiente estão configuradas
3. Se todas as dependências foram instaladas

**API em funcionamento:** ✅ Pronta para uso!