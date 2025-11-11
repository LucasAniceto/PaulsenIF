const Consent = require('../models/Consent');

const validateConsentMiddleware = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Extrair customerId da URL ou do query params
      let customerId = req.params.customerId;

      if (!customerId) {
        return res.status(400).json({ error: 'customerId é obrigatório na rota' });
      }

      // Buscar consentimento ativo e não expirado
      const consent = await Consent.findOne({
        customerId,
        status: 'AUTHORIZED',
        expiresAt: { $gt: new Date() }
      });

      // Se não existe consentimento válido, retornar 403
      if (!consent) {
        return res.status(403).json({
          error: 'Consentimento não autorizado ou expirado'
        });
      }

      // Se há permissões obrigatórias, verificar se o consentimento as possui
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(permission =>
          consent.permissions.includes(permission)
        );

        if (!hasPermission) {
          return res.status(403).json({
            error: `Permissões insuficientes. Requeridas: ${requiredPermissions.join(', ')}`
          });
        }
      }

      // Adicionar consentimento ao objeto request para uso posterior
      req.consent = consent;
      req.customerId = customerId;

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao validar consentimento' });
    }
  };
};

module.exports = {
  validateConsentMiddleware
};
