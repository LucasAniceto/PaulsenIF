const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Valor deve ser maior que zero']
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    ref: 'Account',
    required: true
  }
}, {
  _id: false
});

module.exports = mongoose.model('Transaction', transactionSchema);