const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getPendingHandoverBookings,
    confirmHandover,
    confirmReturn
} = require('./booking-staff.controller');

router.get('/pending-handover', authMiddleware, authorizeRoles('staff', 'admin'), getPendingHandoverBookings);
router.patch('/:id/confirm-handover', authMiddleware, authorizeRoles('staff', 'admin'), confirmHandover);
router.patch('/:id/confirm-return', authMiddleware, authorizeRoles('staff', 'admin'), confirmReturn);

module.exports = router;