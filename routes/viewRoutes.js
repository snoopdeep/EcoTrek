const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

// isLoggedIn to render templates-> user has to be logged in then set res.locals.user = currentUser;
// getAccount is a protected route so it will also use: findById(decoded.id) and if if run isLoggedIn middleware too so operation become expensive..
// so use isLoggedIn only in getOverview getTour and login
// user protect in getAccount-> user variable is also available after protect middleware
// router.use(authController.isLoggedIn);

// overview page route( this is the home route page)
router.get('/',bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);
// tour page route
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
// login route
router.get('/login', authController.isLoggedIn, viewController.login);
// account route
router.get('/me', authController.protect, viewController.getAccount);
// rendering / getting all booked tours of a user
router.get('/my-tours',authController.protect,viewController.getMyTours);
// updating user name and email
router
    .route('/submit-user-data')
    .post(authController.protect, viewController.updateUserData);
    

module.exports = router;
