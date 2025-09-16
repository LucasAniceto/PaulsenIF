const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

const createTransaction = async (req, res) => {
  try {
    const { _id, date, description, amount, type, category, accountId } = req.body;
    
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    if (type === 'debit' && account.balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }
    
    const transaction = new Transaction({
      _id,
      date,
      description,
      amount,
      type,
      category
    });
    
    await transaction.save();
    
    if (type === 'credit') {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }
    
    account.transactions.push(_id);
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