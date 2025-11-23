const mongoose = require('mongoose');
const { validateCPF } = require('../utils/cpfValidator');

const customerSchema = new mongoose.Schema({
  _id: {
    type: String
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    validate: {
      validator: function(v) {
        return /^[A-Za-zÀ-ÿ\s]+$/.test(v);
      },
      message: 'Nome deve conter apenas letras e espaços'
    }
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    // validate: {
    //   validator: function(v) {
    //     return validateCPF(v);
    //   },
    //   message: 'CPF inválido'
    // }
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email inválido'
    }
  },
  accounts: [{
    type: String,
    ref: 'Account'
  }]
}, {
  _id: false
});

customerSchema.index({ email: 1 });

module.exports = mongoose.model('Customer', customerSchema);