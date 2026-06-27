const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const { getAllTickets, replyTicket } = require('./support-staff.controller');

router.get('/', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), getAllTickets);
router.patch('/:id/reply', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), replyTicket);

module.exports = router;