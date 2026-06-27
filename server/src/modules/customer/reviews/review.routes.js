const express = require('express');
const router = express.Router();

const authMiddleware = require('../../../middlewares/auth.middleware');
const authorizeRoles = require('../../../middlewares/role.middleware');
const {
    createReview,
    getMyReviews
} = require('./review.controller');

router.get('/', authMiddleware, authorizeRoles('customer', 'admin'), getMyReviews);
router.post('/', authMiddleware, authorizeRoles('customer'), createReview);

module.exports = router;