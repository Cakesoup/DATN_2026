const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getOverviewReport,
    getRevenueReport
} = require('./report-admin.controller');

router.get('/overview', authMiddleware, authorizeRoles('admin'), getOverviewReport);
router.get('/revenue', authMiddleware, authorizeRoles('admin'), getRevenueReport);

module.exports = router;