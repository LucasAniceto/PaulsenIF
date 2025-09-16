# API da Instituição Financeira

## Configuração

1. Instalar dependências:
```bash
npm install
```

2. Configurar MongoDB (certifique-se que está rodando na porta 27017)

3. Iniciar a aplicação:
```bash
npm run dev
```

## Endpoints

### 1. Criar Cliente
```
POST /api/customers
{
  "_id": "cus_001",
  "name": "Maria Silva",
  "cpf": "12345678900",
  "email": "maria.silva@email.com"
}
```

### 2. Criar Conta
```
POST /api/accounts
{
  "_id": "acc_001",
  "type": "checking",
  "branch": "0001",
  "number": "12345-6",
  "customerId": "cus_001"
}
```

### 3. Consultar Saldo
```
GET /api/accounts/acc_001/balance
```

### 4. Criar Transação
```
POST /api/transactions
{
  "_id": "txn_001",
  "date": "2025-09-09",
  "description": "Deposit via wire transfer",
  "amount": 1000.00,
  "type": "credit",
  "category": "Income",
  "accountId": "acc_001"
}
```

### 5. Listar Transações (Extrato)
```
GET /api/transactions/account/acc_001
```

## Exemplos de Uso

1. Criar cliente
2. Criar conta para o cliente
3. Fazer depósito (transação credit)
4. Consultar saldo
5. Fazer saque (transação debit)
6. Consultar extrato