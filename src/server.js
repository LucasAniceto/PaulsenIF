require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const openfinanceRoutes = require('./routes/openfinanceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware para tratar JSON malformado
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'JSON malformado' });
  }
  next();
});

app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);
app.use('/openfinance', openfinanceRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Instituição Financeira',
    version: '1.0.0',
    status: 'ativo',
    endpoints: {
      customers: 'POST /customers',
      accounts: 'POST /accounts, GET /accounts/:id/balance',
      transactions: 'POST /transactions, GET /transactions/:accountId'
    }
  });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Exportar para Vercel
module.exports = app;