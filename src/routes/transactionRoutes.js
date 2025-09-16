const express = require('express');
const { createTransaction, getTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.post('/', createTransaction);
router.get('/account/:accountId', getTransactions);

module.exports = router;