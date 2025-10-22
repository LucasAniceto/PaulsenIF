const Account = require('../models/Account');
const Customer = require('../models/Customer');
const { generateAccountId } = require('../utils/idGenerator');

const createAccount = async (req, res) => {
  try {
    const { type, branch, number, customerId } = req.body;
    
    // Validações básicas
    if (!customerId) {
      return res.status(400).json({ error: 'ID do cliente é obrigatório' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Tipo da conta é obrigatório' });
    }
    
    if (!branch) {
      return res.status(400).json({ error: 'Agência é obrigatória' });
    }
    
    if (!number) {
      return res.status(400).json({ error: 'Número da conta é obrigatório' });
    }
    
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se já existe conta com mesmo número e agência
    const existingAccount = await Account.findOne({ branch, number });
    if (existingAccount) {
      return res.status(400).json({ error: 'Já existe uma conta com este número e agência' });
    }
    
    const accountId = await generateAccountId();
    
    const account = new Account({
      _id: accountId,
      type,
      branch,
      number,
      balance: 0,
      transactions: [],
      customerId: customerId
    });
    
    await account.save();
    
    customer.accounts.push(accountId);
    await customer.save();
    
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const account = await Account.findOne({ _id: accountId });
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