const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Data deve estar no formato YYYY-MM-DD'
    }
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  category: {
    type: String,
    required: true
  }
}, {
  _id: false
});

module.exports = mongoose.model('Transaction', transactionSchema);