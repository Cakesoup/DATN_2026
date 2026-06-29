const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');

const {
    getAllVehiclesForStaff,
    getVehicleByIdForStaff,
    createVehicleForStaff,
    updateVehicleForStaff,
    deleteVehicleForStaff
} = require('./vehicle-staff.controller');

router.get('/', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), getAllVehiclesForStaff);
router.get('/:id', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), getVehicleByIdForStaff);
router.post('/', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), createVehicleForStaff);
router.put('/:id', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), updateVehicleForStaff);
router.delete('/:id', authMiddleware, authorizeRoles('staff', 'admin', 'manager'), deleteVehicleForStaff);

module.exports = router;