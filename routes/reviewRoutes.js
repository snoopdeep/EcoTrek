const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewControllers = require('../controllers/reviewController');
const authConrollers = require('../controllers/authController');

// AUTHORIZATION.. protect all the routes
router.use(authConrollers.protect);

// getting all reviews
// POST /:tourId/reviews
// POST /reviews
// GET /:tourId/reviews
// GET /reviews
router
    .route('/')
    .get(reviewControllers.getAllReviews)
    // protect post route=> only to login user and role must be user...
    .post(
        authConrollers.protect,
        authConrollers.restrictTo('user'),
        reviewControllers.setTourUserIds,
        reviewControllers.createReview
    );

router
    .route('/:id')
    .get(reviewControllers.getReview)
    .delete(
        authConrollers.restrictTo('user', 'admin'),
        reviewControllers.deleteReview
    )
    .patch(
        authConrollers .restrictTo('user', 'admin'),
        reviewControllers.updateReview
    );

module.exports = router;
