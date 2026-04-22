const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, respondToReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.patch('/:reviewId/respond', protect, respondToReview);
module.exports = router;
