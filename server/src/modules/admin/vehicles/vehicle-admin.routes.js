const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require('./vehicle-admin.controller');

router.get('/', authMiddleware, authorizeRoles('admin', 'manager'), getAllVehicles);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'manager'), getVehicleById);
router.post('/', authMiddleware, authorizeRoles('admin', 'manager'), createVehicle);
router.put('/:id', authMiddleware, authorizeRoles('admin', 'manager'), updateVehicle);
router.delete('/:id', authMiddleware, authorizeRoles('admin', 'manager'), deleteVehicle);

module.exports = router;