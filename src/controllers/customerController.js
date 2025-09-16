const Customer = require('../models/Customer');

const createCustomer = async (req, res) => {
  try {
    const { _id, name, cpf, email } = req.body;
    
    const customer = new Customer({
      _id,
      name,
      cpf,
      email,
      accounts: []
    });
    
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'CPF ou email já cadastrado' });
    }
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createCustomer
};