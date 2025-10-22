const Customer = require('../models/Customer');
const { generateCustomerId } = require('../utils/idGenerator');

const createCustomer = async (req, res) => {
  try {
    const { name, cpf, email } = req.body;
    
    const customerId = await generateCustomerId();
    
    const customer = new Customer({
      _id: customerId,
      name,
      cpf: cpf.replace(/\D/g, ''),
      email,
      accounts: []
    });
    
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${duplicateField === 'cpf' ? 'CPF' : 'Email'} já cadastrado` 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errorMessages[0] });
    }
    
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createCustomer
};