const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  _id: {
    type: String
  },
  customerId: {
    type: String,
    ref: 'Customer',
    required: [true, 'customerId é obrigatório']
  },
  permissions: {
    type: [String],
    enum: [
      'ACCOUNTS_READ',
      'CUSTOMER_DATA_READ',
      'BALANCES_READ',
      'TRANSACTIONS_READ'
    ],
    required: [true, 'Permissões são obrigatórias'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Pelo menos uma permissão deve ser fornecida'
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'AUTHORIZED', 'REJECTED', 'REVOKED'],
    default: 'AUTHORIZED',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // 1 ano de validade
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      return expiryDate;
    }
  }
}, {
  _id: false
});

// Índices
consentSchema.index({ customerId: 1 });
consentSchema.index({ status: 1 });
consentSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Consent', consentSchema);
