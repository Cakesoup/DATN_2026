const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    createPricingPlan,
    getAllPricingPlansForAdmin,
    getPricingPlanByIdForAdmin,
    updatePricingPlan,
    deletePricingPlan
} = require('./pricing-admin.controller');

router.get('/', authMiddleware, authorizeRoles('admin'), getAllPricingPlansForAdmin);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getPricingPlanByIdForAdmin);
router.post('/', authMiddleware, authorizeRoles('admin'), createPricingPlan);
router.patch('/:id', authMiddleware, authorizeRoles('admin'), updatePricingPlan);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deletePricingPlan);

module.exports = router;