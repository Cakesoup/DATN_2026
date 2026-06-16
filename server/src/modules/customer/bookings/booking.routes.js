const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
} = require('./booking.controller');

router.post('/', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), createBooking);
router.get('/', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), getMyBookings);
router.get('/:id', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), getBookingById);
router.patch('/:id/cancel', authMiddleware, authorizeRoles('customer', 'admin', 'staff'), cancelBooking);
module.exports = router;