const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getMyAdminProfile,
    updateMyAdminProfile,
    changeMyAdminPassword
} = require('./profile-admin.controller');

router.get('/me', authMiddleware, authorizeRoles('admin'), getMyAdminProfile);
router.patch('/me', authMiddleware, authorizeRoles('admin'), updateMyAdminProfile);
router.patch('/me/change-password', authMiddleware, authorizeRoles('admin'), changeMyAdminPassword);

module.exports = router;