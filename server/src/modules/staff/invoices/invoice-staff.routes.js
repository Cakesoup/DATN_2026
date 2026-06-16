const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    createInvoice,
    getInvoiceByIdForStaff
} = require('./invoice-staff.controller');

router.post('/', authMiddleware, authorizeRoles('staff', 'admin'), createInvoice);
router.get('/:id', authMiddleware, authorizeRoles('staff', 'admin'), getInvoiceByIdForStaff);

module.exports = router;