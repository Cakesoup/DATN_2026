const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} = require('./profile.controller');

router.get('/me', authMiddleware, authorizeRoles('customer', 'staff', 'admin'), getMyProfile);
router.patch('/me', authMiddleware, authorizeRoles('customer', 'staff', 'admin'), updateMyProfile);
router.patch('/me/change-password', authMiddleware, authorizeRoles('customer', 'staff', 'admin'), changeMyPassword);

module.exports = router;