const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getAllVehiclesForStaff,
    getVehicleByIdForStaff,
    updateVehicleStatus
} = require('./vehicle-staff.controller');

router.get('/', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), getAllVehiclesForStaff);
router.get('/:id', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), getVehicleByIdForStaff);
router.patch('/:id/status', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), updateVehicleStatus);

module.exports = router;