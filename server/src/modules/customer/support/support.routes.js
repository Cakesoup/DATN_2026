const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const { createTicket, getMyTickets } = require('./support.controller');

router.get('/', authMiddleware, authorizeRoles('customer'), getMyTickets);
router.post('/', authMiddleware, authorizeRoles('customer'), createTicket);

module.exports = router;