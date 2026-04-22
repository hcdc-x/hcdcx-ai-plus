const express = require('express');
const router = express.Router();
const {
  getAllCodes,
  getCodeById,
  generateCode,
  updateCode,
  deleteCode,
  duplicateCode,
  regenerateCode,
} = require('../controllers/codeController');
const { authenticate, checkOwnership } = require('../middleware/auth');
const { generationLimiter } = require('../middleware/rateLimit');
const { validate, validationRules } = require('../middleware/validation');
const Code = require('../models/Code');

// All code routes require authentication
router.use(authenticate);

router.route('/')
  .get(getAllCodes)
  .post(
    generationLimiter,
    validate(validationRules.generateCode),
    generateCode
  );

router.route('/:id')
  .get(validate(validationRules.objectId), getCodeById)
  .patch(
    validate(validationRules.objectId),
    checkOwnership(Code),
    updateCode
  )
  .delete(
    validate(validationRules.objectId),
    checkOwnership(Code),
    deleteCode
  );

router.post(
  '/:id/duplicate',
  validate(validationRules.objectId),
  checkOwnership(Code),
  duplicateCode
);

router.post(
  '/:id/regenerate',
  validate(validationRules.objectId),
  checkOwnership(Code),
  regenerateCode
);

module.exports = router;
