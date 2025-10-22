const Counter = require('../models/Counter');

const getNextSequence = async (sequenceName) => {
  const counter = await Counter.findById(sequenceName);
  
  if (!counter) {
    const newCounter = new Counter({ _id: sequenceName, sequenceValue: 1 });
    await newCounter.save();
    return 1;
  }
  
  const result = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequenceValue: 1 } },
    { new: true }
  );
  return result.sequenceValue;
};

const generateCustomerId = async () => {
  try {
    const nextNumber = await getNextSequence('customer');
    return `cus_${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    throw new Error('Erro ao gerar ID do cliente');
  }
};

const generateAccountId = async () => {
  try {
    const nextNumber = await getNextSequence('account');
    return `acc_${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    throw new Error('Erro ao gerar ID da conta');
  }
};

const generateTransactionId = async () => {
  try {
    const nextNumber = await getNextSequence('transaction');
    return `txn_${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    throw new Error('Erro ao gerar ID da transação');
  }
};

module.exports = {
  generateCustomerId,
  generateAccountId,
  generateTransactionId
};