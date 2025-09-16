const Account = require('../models/Account');
const Customer = require('../models/Customer');

const createAccount = async (req, res) => {
  try {
    const { _id, type, branch, number, customerId } = req.body;
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    const account = new Account({
      _id,
      type,
      branch,
      number,
      balance: 0,
      transactions: []
    });
    
    await account.save();
    
    customer.accounts.push(_id);
    await customer.save();
    
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    
    res.json({ 
      accountId: account._id,
      balance: account.balance 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createAccount,
  getBalance
};