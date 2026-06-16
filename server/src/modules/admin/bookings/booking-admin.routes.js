const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getAllBookings,
    getBookingByIdForAdmin,
    updateBookingStatusByAdmin
} = require('./booking-admin.controller');

router.get('/', authMiddleware, authorizeRoles('admin'), getAllBookings);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getBookingByIdForAdmin);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), updateBookingStatusByAdmin);

module.exports = router;