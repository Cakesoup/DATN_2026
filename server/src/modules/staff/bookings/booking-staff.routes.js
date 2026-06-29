const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getStaffBookings,
    getPendingHandoverBookings,
    confirmBooking,
    confirmHandover,
    confirmReturn
} = require('./booking-staff.controller');

router.get('/', authMiddleware, authorizeRoles('staff', 'admin'), getStaffBookings);
router.get('/pending-handover', authMiddleware, authorizeRoles('staff', 'admin'), getPendingHandoverBookings);
router.patch('/:id/confirm', authMiddleware, authorizeRoles('staff', 'admin'), confirmBooking);
router.patch('/:id/confirm-handover', authMiddleware, authorizeRoles('staff', 'admin'), confirmHandover);
router.patch('/:id/confirm-return', authMiddleware, authorizeRoles('staff', 'admin'), confirmReturn);

module.exports = router;