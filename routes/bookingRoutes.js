const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authConrollers = require('../controllers/authController');

router.use(authConrollers.protect);
router
    .route('/checkoutSession/:tourId')
    .get(bookingController.getCheckoutSession);

router
    .route('/')
    .get(bookingController.getAllBooking)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
