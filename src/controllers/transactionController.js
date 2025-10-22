const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { generateTransactionId } = require('../utils/idGenerator');

const createTransaction = async (req, res) => {
  try {
    const { description, amount, type, category, accountId } = req.body;
    
    // Validações básicas
    if (!accountId) {
      return res.status(400).json({ error: 'ID da conta é obrigatório' });
    }
    
    if (!description) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }
    
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Valor é obrigatório' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }
    
    // Validar valor máximo (999999999.99)
    if (amount > 999999999.99) {
      return res.status(400).json({ error: 'Valor excede o limite máximo permitido' });
    }
    
    if (!type || (type !== 'credit' && type !== 'debit')) {
      return res.status(400).json({ error: 'Tipo deve ser "credit" ou "debit"' });
    }
    
    if (!category) {
      return res.status(400).json({ error: 'Categoria é obrigatória' });
    }
    
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    if (type === 'debit' && account.balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    
    const transactionId = await generateTransactionId();
    
    const transaction = new Transaction({
      _id: transactionId,
      date: new Date(),
      description,
      amount: Math.round(amount * 100) / 100, // Arredondar para 2 casas decimais
      type,
      category,
      accountId
    });
    
    await transaction.save();
    
    if (type === 'credit') {
      account.balance += transaction.amount;
    } else {
      account.balance -= transaction.amount;
    }
    
    account.balance = Math.round(account.balance * 100) / 100; // Arredondar saldo
    account.transactions.push(transactionId);
    await account.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findById(accountId).populate('transactions');
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    res.json({
      accountId: account._id,
      transactions: account.transactions
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions
};