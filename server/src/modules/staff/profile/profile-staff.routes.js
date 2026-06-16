const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getMyStaffProfile,
    updateMyStaffProfile,
    changeMyStaffPassword
} = require('./profile-staff.controller');

router.get('/me', authMiddleware, authorizeRoles('staff', 'admin'), getMyStaffProfile);
router.patch('/me', authMiddleware, authorizeRoles('staff', 'admin'), updateMyStaffProfile);
router.patch('/me/change-password', authMiddleware, authorizeRoles('staff', 'admin'), changeMyStaffPassword);

module.exports = router;