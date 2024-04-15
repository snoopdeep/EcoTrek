const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getOverview = catchAsync(async (req, res, next) => {
    console.log('Hi from the getOverview middleware viewController.js..');
    // 1: GET ALL TOURS DATA FROM COLLECTION
    const tours = await Tour.find();
    // console.log(tours);

    // 2: BUILD TEMPLATE-> in overview.pug

    // 3: RENDER THE TEMPLATE USING TOUR DATA FROM 1
    res.status(200).render('overview', {
        tours: tours,
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
    // 1: GET THE TOUR DATA ALONG WHICH SHOULD CONTAIN GUIDE AND REVIEWS
    // we have to find by slug coming from params not by id.. populate the review .. guide is already populated when we
    // query find(in tour model)

    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        // since we define virtual property on tour so review will be avaible when tour is query
        path: 'review',
        field: 'review rating user',
    });

    // 1: If no tour find send error to AppError for render an error page..
    if (!tour) {
        // return to global error handling by passing the message and statusCode-> AppError Class...
        // Dont forgate to call next() for jupming to next middleware..
        // console.log('This is from viewController and no tour find..');
        return next(new AppError('There is No tour with that name!', 404));
    }

    // 2: BUILD TEMPLATE-> tour.pug

    // 3: RENDER THE TEMPLATE USING TOUR DATA
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
});

// LOGIN

exports.login = (req, res) => {
    res.status(200).render('login', {
        title: 'Login here',
    });
};

// SIGNUP
exports.signup = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign Up',
    });
};

// getAccount -> rendering getAccount page.
exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account',
    });
};

// updating user email and password-> req sent from form element

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log(
    //     'this is from viewcontroller and the data send for update through form is ',
    //     req.body
    // );
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.NameVariable,
            email: req.body.EmailVariable,
        },
        {
            new: true, // return updated documents
            runValidators: true, // check for valid data before saving to db
        }
    );
    // Render the same page ie page of current user..

    res.status(200).render('account', {
        title: 'Your Account',
    });
});

// GETTING ALL BOOKED TOURS OF A USER
exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1:find all booking doc corresponding to login user

    const bookings = await Booking.find({ user: req.user.id });

    // 2: get all the tour ids of all the documents find.. so it will be an array of tour id
    const tourIds = bookings.map((el) => el.tour);
    // 3: get all the tour by tour array from 2
    const tours = await Tour.find({ _id: { $in: tourIds } });

    // 4: render the overview page by tour find
    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
    });
});
