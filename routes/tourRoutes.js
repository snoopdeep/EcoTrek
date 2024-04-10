const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
// router.param('id', tourController.checkID);
//CREATING A CHECK BODY MIDDLEWARE
// BODY=> NAME AND PRICE;
// alice router

//ROUTER FOR CREATING REVIEWS
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview
//     );

// MOUNTING REVIEW ROUTER IF /:tourId/review
router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliceMiddleware, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);

router
    .route('/monthly_plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guid', 'guide'),
        tourController.getMonthlyPlan
    );
// GEOSPARTIAL QUERIES
// find a tour nearby(center) within a certain distance
//END-POINT: '/tours-within/:distance/center/:latlng/unit/:unit'
// '/tours-within/500/center/-34,45.45/unit/km'
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getTourWithin);

// Calculating the distances of all the tours from a certain point( current location(latlng) )..
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guid', 'guide'),
        tourController.createTour
    ); //tourController.checkBody,
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guid', 'guide'),
        tourController.uploadTourPhotos,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guid'),
        tourController.deleteTour
    );

module.exports = router;
