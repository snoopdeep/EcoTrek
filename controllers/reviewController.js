const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

// GET ALL REVIEWS

exports.getAllReviews= factory.getAll(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };
//     const reviews = await Review.find(filter);
//     // console.log(reviews);

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews,
//         },
//     });
// });

// CREATE REVIEW

// ADDING MIDDLEWARE FOR SETTING USER AND TOUR_ID...
exports.setTourUserIds = (req,res,next)=>{
    // console.log(req.body);
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    // console.log(req.body);
    next();
}

exports.createReview= factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//     // if userId and tour id is not send from body.. get it form route and currently login user
//     // THIS IS HANDLING IN MIDDLEWARE NOW ..
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;

//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview,
//         },
//     });
// });

// DELETING A REVIEW
exports.deleteReview = factory.deleteOne(Review);
// UPDATING A REVIEW
exports.updateReview = factory.updateOne(Review);

// GET REVIEW

exports.getReview= factory.getOne(Review);
