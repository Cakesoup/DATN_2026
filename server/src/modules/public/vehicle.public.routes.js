const express = require('express');
const router = express.Router();

// Dùng lại controller vehicles của customer — KHÔNG gắn auth (public)
const {
    getAllVehicles,
    getVehicleById
} = require('../customer/vehicles/vehicle.controller');

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

module.exports = router;