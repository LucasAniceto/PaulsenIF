require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API da Instituição Financeira',
    version: '1.0.0',
    endpoints: {
      customers: 'POST /api/customers',
      accounts: 'POST /api/accounts, GET /api/accounts/:id/balance',
      transactions: 'POST /api/transactions, GET /api/transactions/account/:accountId'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});