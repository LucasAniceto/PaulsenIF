const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{11}$/.test(v);
      },
      message: 'CPF deve ter 11 dígitos'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  accounts: [{
    type: String,
    ref: 'Account'
  }]
}, {
  _id: false
});

module.exports = mongoose.model('Customer', customerSchema);