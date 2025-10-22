const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['checking', 'savings'],
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  customerId: {
    type: String,
    ref: 'Customer',
    required: true
  },
  transactions: [{
    type: String,
    ref: 'Transaction'
  }]
}, {
  _id: false
});

// Índices
accountSchema.index({ branch: 1, number: 1 }, { unique: true });
accountSchema.index({ customerId: 1 });

module.exports = mongoose.model('Account', accountSchema);