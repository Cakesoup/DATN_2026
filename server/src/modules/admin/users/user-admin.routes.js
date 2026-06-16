const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    getAllUsers,
    getUserById,
    createUserByAdmin,
    updateUserByAdmin,
    updateUserStatusByAdmin,
    deleteUserByAdmin
} = require('./user-admin.controller');

router.get('/', authMiddleware, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authMiddleware, authorizeRoles('admin'), getUserById);
router.post('/', authMiddleware, authorizeRoles('admin'), createUserByAdmin);
router.patch('/:id', authMiddleware, authorizeRoles('admin'), updateUserByAdmin);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), updateUserStatusByAdmin);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), deleteUserByAdmin);

module.exports = router;