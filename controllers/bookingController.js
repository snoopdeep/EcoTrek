const Tour = require('./../models/tourModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError.js');
const Booking = require('../models/bookingModel.js');
const factory = require('../controllers/handlerFactory');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1: GET CURRENTLY BOOKED TOURS
    const tour = await Tour.findById(req.params.tourId);
    console.log('This is from the getCheckoutSession....');

    const product = await stripe.products.create({
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
    });

    const price = await stripe.prices.create({
        unit_amount: tour.price * 100,
        currency: 'usd',
        product: product.id,
    });

    // 2: CRAETE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        // adding query to success url for creating booking in db
        success_url: `${req.protocol}://${req.get('host')}/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        payment_method_types: ['card'],
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: 'payment',
    });

    // 3: SEND SESSION AS RESPONSE
    res.status(200).json({
        status: 'success',
        session,
    });
});

// MIDDLEWARE FOR CREATING BOOKING IN DB ON SUCESSFULL CHECKOUT OR ON CLICKING SUCCESS_URL OF SESSION
// THIS IS ONLY TEMPORARY COZ EVERYONE CAN MAKE BOOKING WITHOUT PAYING..
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    console.log('This is from createBookingCheckout.. and the new booking is going to create in db..');
    await Booking.create({ tour, user, price });
    // redirecting to root url directly to hide success_url
    res.redirect(req.originalUrl.split('?')[0]);
    next();
});


// CRUD ON BOOKING API
exports.createBooking=factory.createOne(Booking);
exports.getBooking=factory.getOne(Booking);
exports.getAllBooking=factory.getAll(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);