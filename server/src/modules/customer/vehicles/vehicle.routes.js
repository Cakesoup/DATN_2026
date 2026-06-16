const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    getAllVehicles,
    getVehicleById
} = require('./vehicle.controller');

router.get('/', authMiddleware, authorizeRoles('customer', 'admin', 'manager', 'staff'), getAllVehicles);
router.get('/:id', authMiddleware, authorizeRoles('customer', 'admin', 'manager', 'staff'), getVehicleById);

module.exports = router;