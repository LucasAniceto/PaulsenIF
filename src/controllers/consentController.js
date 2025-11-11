const Consent = require('../models/Consent');
const Customer = require('../models/Customer');

const createConsent = async (req, res) => {
  try {
    const { customerId, permissions } = req.body;

    // Validações básicas
    if (!customerId) {
      return res.status(400).json({ error: 'customerId é obrigatório' });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ error: 'Permissões devem ser um array não-vazio' });
    }

    // Validar se o cliente existe
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Validar permissões fornecidas
    const validPermissions = ['ACCOUNTS_READ', 'CUSTOMER_DATA_READ', 'BALANCES_READ', 'TRANSACTIONS_READ'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({ error: `Permissões inválidas: ${invalidPermissions.join(', ')}` });
    }

    // Verificar se já existe um consentimento ativo para este cliente
    const existingConsent = await Consent.findOne({
      customerId,
      status: 'AUTHORIZED',
      expiresAt: { $gt: new Date() }
    });

    if (existingConsent) {
      return res.status(400).json({ error: 'Cliente já possui um consentimento ativo' });
    }

    // Criar novo consentimento (UUID simples para _id)
    const consentId = `cst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const consent = new Consent({
      _id: consentId,
      customerId,
      permissions,
      status: 'AUTHORIZED',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    });

    await consent.save();
    res.status(201).json(consent);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errorMessages[0] });
    }

    res.status(400).json({ error: error.message });
  }
};

const getConsent = async (req, res) => {
  try {
    const { id } = req.params;

    const consent = await Consent.findById(id);
    if (!consent) {
      return res.status(404).json({ error: 'Consentimento não encontrado' });
    }

    res.status(200).json(consent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const revokeConsent = async (req, res) => {
  try {
    const { id } = req.params;

    const consent = await Consent.findById(id);
    if (!consent) {
      return res.status(404).json({ error: 'Consentimento não encontrado' });
    }

    // Atualizar status para REVOKED
    consent.status = 'REVOKED';
    await consent.save();

    res.status(200).json({
      message: 'Consentimento revogado com sucesso',
      consent
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createConsent,
  getConsent,
  revokeConsent
};
