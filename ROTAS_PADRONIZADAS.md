# 🚀 Rotas Padronizadas - Checklist de Testes

## ✅ Implementação Concluída

Todas as rotas foram consolidadas sob o prefixo `/openfinance` para padronização entre múltiplas instituições financeiras.

---

## 📋 Rotas Implementadas

### 1️⃣ Status (Público)
```bash
GET /openfinance/
```

**Esperado:** Retorna informações da API com versão 2.0.0 e lista de endpoints

---

### 2️⃣ Criar Cliente (Público)
```bash
POST /openfinance/customers
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "123.456.789-09",
  "email": "joao@example.com"
}
```

**Esperado:** 201 - Cliente criado com _id: "cus_001"

---

### 3️⃣ Criar Conta (Público)
```bash
POST /openfinance/accounts
Content-Type: application/json

{
  "type": "checking",
  "branch": "0001",
  "number": "123456",
  "customerId": "cus_001"
}
```

**Esperado:** 201 - Conta criada com _id: "acc_001"

---

### 4️⃣ Criar Transação (Público)
```bash
POST /openfinance/transactions
Content-Type: application/json

{
  "description": "Depósito inicial",
  "amount": 1000,
  "type": "credit",
  "category": "deposit",
  "accountId": "acc_001"
}
```

**Esperado:** 201 - Transação criada com _id: "txn_001"

---

### 5️⃣ Criar Consentimento (Público)
```bash
POST /openfinance/consents
Content-Type: application/json

{
  "customerId": "cus_001",
  "permissions": ["ACCOUNTS_READ", "CUSTOMER_DATA_READ", "BALANCES_READ", "TRANSACTIONS_READ"]
}
```

**Esperado:** 201 - Consentimento criado com status: "AUTHORIZED"

---

### 6️⃣ Buscar Consentimento (Público)
```bash
GET /openfinance/consents/:consentId
```

**Esperado:** 200 - Dados do consentimento

---

### 7️⃣ Revogar Consentimento (Público)
```bash
DELETE /openfinance/consents/:consentId
```

**Esperado:** 200 - Consentimento revogado com status: "REVOKED"

---

### 8️⃣ Buscar Cliente por CPF (Público - Integração)
```bash
GET /openfinance/customers/lookup/by-cpf/12345678909
```

**Esperado:** 200 - {_id: "cus_001", cpf: "12345678909"}

---

### 9️⃣ Obter Dados do Cliente (Protegido)
```bash
GET /openfinance/customers/cus_001
```

**Requer:** Consentimento com CUSTOMER_DATA_READ

**Esperado:** 200 - Dados do cliente (sem consentimento: 403)

---

### 🔟 Listar Contas do Cliente (Protegido)
```bash
GET /openfinance/customers/cus_001/accounts
```

**Requer:** Consentimento com ACCOUNTS_READ

**Esperado:** 200 - Lista de contas (sem consentimento: 403)

---

### 1️⃣1️⃣ Obter Saldo da Conta (Protegido)
```bash
GET /openfinance/accounts/acc_001/balance
```

**Requer:** Consentimento com BALANCES_READ

**Esperado:** 200 - {accountId: "acc_001", balance: 1000}

---

### 1️⃣2️⃣ Listar Transações (Protegido)
```bash
GET /openfinance/transactions/acc_001
```

**Requer:** Consentimento com TRANSACTIONS_READ

**Esperado:** 200 - Lista de transações

---

## 🔄 Fluxo Completo de Teste

### Passo 1: Verificar Status
```bash
curl http://localhost:3000/openfinance/
```

### Passo 2: Criar Cliente
```bash
curl -X POST http://localhost:3000/openfinance/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","cpf":"11144477735","email":"test@example.com"}'
```
**Salve o customerId**

### Passo 3: Criar Conta
```bash
curl -X POST http://localhost:3000/openfinance/accounts \
  -H "Content-Type: application/json" \
  -d '{"type":"checking","branch":"0001","number":"123456","customerId":"cus_001"}'
```
**Salve o accountId**

### Passo 4: Criar Transação
```bash
curl -X POST http://localhost:3000/openfinance/transactions \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","amount":1000,"type":"credit","category":"deposit","accountId":"acc_001"}'
```

### Passo 5: Buscar por CPF
```bash
curl http://localhost:3000/openfinance/customers/lookup/by-cpf/11144477735
```

### Passo 6: Criar Consentimento
```bash
curl -X POST http://localhost:3000/openfinance/consents \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_001","permissions":["ACCOUNTS_READ","CUSTOMER_DATA_READ","BALANCES_READ","TRANSACTIONS_READ"]}'
```
**Salve o consentId**

### Passo 7: Acessar Dados Protegidos
```bash
# Com consentimento - deve funcionar (200)
curl http://localhost:3000/openfinance/customers/cus_001/accounts

# Sem consentimento (após revogar) - deve retornar 403
curl -X DELETE http://localhost:3000/openfinance/consents/:consentId
curl http://localhost:3000/openfinance/customers/cus_001/accounts
```

---

## ✨ Benefícios da Padronização

| Antes | Depois |
|-------|--------|
| `POST /customers` | `POST /openfinance/customers` |
| `POST /accounts` | `POST /openfinance/accounts` |
| `POST /transactions` | `POST /openfinance/transactions` |
| `GET /` | `GET /openfinance/` |
| `POST /openfinance/consents` | `POST /openfinance/consents` ✅ |

---

## 📂 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/routes/openfinanceRoutes.js` | ✅ Consolidadas todas as rotas |
| `src/server.js` | ✅ Removidas rotas antigas, mantém apenas `/openfinance` |
| `src/routes/customerRoutes.js` | ⚠️ Ainda existe (não usado) |
| `src/routes/accountRoutes.js` | ⚠️ Ainda existe (não usado) |
| `src/routes/transactionRoutes.js` | ⚠️ Ainda existe (não usado) |

---

## 🧹 Limpeza Opcional

Os arquivos de rotas antigas podem ser deletados quando confirmado que tudo está funcionando:

```bash
rm src/routes/customerRoutes.js
rm src/routes/accountRoutes.js
rm src/routes/transactionRoutes.js
```

---

## 🔗 Integração com Outras Instituições

Agora é fácil conectar múltiplas instituições financeiras:

```javascript
app.use('/openfinance/instituicao1', instituicao1Routes);
app.use('/openfinance/instituicao2', instituicao2Routes);
app.use('/openfinance/instituicao3', instituicao3Routes);
```

Ou com um API Gateway:
```
GET /api/instituicao1/openfinance/customers
GET /api/instituicao2/openfinance/customers
```

---

## ✅ Próximos Passos

1. Testar todas as rotas com o novo prefixo
2. Confirmar que rotas antigas não funcionam mais
3. Fazer commit e push
4. Deletar arquivos de rotas antigas
5. Fazer novo commit

