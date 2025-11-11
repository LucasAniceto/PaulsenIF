const express = require('express');
const { createConsent, getConsent, revokeConsent } = require('../controllers/consentController');
const { validateConsentMiddleware } = require('../middlewares/consentMiddleware');
const Account = require('../models/Account');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ====== CONSENTIMENTO ======

// POST /openfinance/consents - Criar consentimento (público)
router.post('/consents', createConsent);

// GET /openfinance/consents/:id - Consultar consentimento (público)
router.get('/consents/:id', getConsent);

// DELETE /openfinance/consents/:id - Revogar consentimento (público)
router.delete('/consents/:id', revokeConsent);

// ====== BUSCA POR CPF (INTEGRAÇÃO) ======

// GET /openfinance/customers/lookup/by-cpf/:cpf - Buscar customerId por CPF (sem proteção)
router.get('/customers/lookup/by-cpf/:cpf', async (req, res) => {
  try {
    const { cpf } = req.params;

    if (!cpf || cpf.length < 11) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Remover caracteres especiais
    const cleanCpf = cpf.replace(/\D/g, '');

    const customer = await Customer.findOne({ cpf: cleanCpf });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.status(200).json({
      _id: customer._id,
      cpf: customer.cpf
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// ====== ROTAS PROTEGIDAS ======

// GET /openfinance/customers/:customerId - Obter dados do cliente (requer CUSTOMER_DATA_READ)
router.get(
  '/customers/:customerId',
  validateConsentMiddleware(['CUSTOMER_DATA_READ']),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Retornar apenas dados essenciais
      res.status(200).json({
        _id: customer._id,
        name: customer.name,
        cpf: customer.cpf,
        email: customer.email
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }
);

// GET /openfinance/customers/:customerId/accounts - Listar contas do cliente (requer ACCOUNTS_READ)
router.get(
  '/customers/:customerId/accounts',
  validateConsentMiddleware(['ACCOUNTS_READ']),
  async (req, res) => {
    try {
      const { customerId } = req.params;

      const accounts = await Account.find({ customerId });

      res.status(200).json({
        customerId,
        accounts: accounts.map(acc => ({
          _id: acc._id,
          type: acc.type,
          branch: acc.branch,
          number: acc.number,
          balance: acc.balance
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar contas' });
    }
  }
);

// GET /openfinance/accounts/:accountId/balance - Obter saldo da conta (requer BALANCES_READ)
router.get(
  '/accounts/:accountId/balance',
  async (req, res) => {
    try {
      const { accountId } = req.params;

      const account = await Account.findById(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Validar consentimento com customerId da conta
      const consentMiddleware = validateConsentMiddleware(['BALANCES_READ']);
      req.params.customerId = account.customerId;

      consentMiddleware(req, res, () => {
        res.status(200).json({
          accountId: account._id,
          balance: account.balance
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter saldo' });
    }
  }
);

// GET /openfinance/transactions/:accountId - Listar transações da conta (requer TRANSACTIONS_READ)
router.get(
  '/transactions/:accountId',
  async (req, res) => {
    try {
      const { accountId } = req.params;

      const account = await Account.findById(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Validar consentimento com customerId da conta
      const consentMiddleware = validateConsentMiddleware(['TRANSACTIONS_READ']);
      req.params.customerId = account.customerId;

      consentMiddleware(req, res, async () => {
        const transactions = await Transaction.find({ accountId });

        res.status(200).json({
          accountId,
          transactions: transactions.map(txn => ({
            _id: txn._id,
            date: txn.date,
            description: txn.description,
            amount: txn.amount,
            type: txn.type,
            category: txn.category
          }))
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar transações' });
    }
  }
);

module.exports = router;
