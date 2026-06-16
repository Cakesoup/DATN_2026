const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    getMyInvoices,
    getMyInvoiceById
} = require('./invoice.controller');

router.get('/', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), getMyInvoices);
router.get('/:id', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), getMyInvoiceById);

module.exports = router;