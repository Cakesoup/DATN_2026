const express = require('express');
const router = express.Router();

const { getActivePricingPlans } = require('./pricing.controller');

router.get('/', getActivePricingPlans);

module.exports = router;