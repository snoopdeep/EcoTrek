const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty...'],
        },
        rating: {
            type: Number,
            // required: [true, 'Please rate the tour'],
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        //Referance to tour
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour..'],
        },

        //Referance to user
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must have a author..'],
        },
    },

    // for displaying virtual property to user
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// PREVENTING one user to post many review on same tour.. so userId+tourId unique -> Use compound index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// poputating tour and user data in reviewModel.. middleware1
reviewSchema.pre(/^find/, function (next) {
    this
        // .populate({
        //     path:'tour',
        //     select:'name',
        // })
        .populate({
            path: 'user',
            select: 'name photo',
        });
    next();
});

// CALCULATING ratingsAverage and ratingQuantity...for displaying summery of review of each tour..
// when a review is added/deleted/updated-> ratingQuantity and ratingAvg changed
// a function(static method..) which takes tourId and calculate ratingAvg and ratingQun and update it to the db
// call the function using a middleware each time when a review is added/deleted/updated => save..

reviewSchema.statics.calAverageRatings = async function (tourId) {
    // this-> points to current Model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);[ { _id: 5c8a1ec62f8fb814b56fa183, nRating: 5, avgRating: 2.8 } ]
    console.log(stats);
    // updating the tour with stats..
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            // update the fields of Tour Model by corresponding calculated stats..
            ratingsAverage: stats[0].nRating,
            ratingsQuantity: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            // update the fields of Tour Model by corresponding calculated stats..
            ratingsAverage: 0,
            ratingsQuantity: 4.5,
        });
    }
};
// each time when a review is added/deleted/updated call the above funtion attach to currentModel.. post middleware coz
// we have to calculate after review finished..
// post middleware has no next()
// calAverageRatings() is avaible on model..

//  1->ON CREATE A NEW REVIEW
reviewSchema.post('save', function () {
    // this point to current Doc ie review since it is post middleware.. and this.tour has tourId
    // Review.=> is not yet defined. use this.constructor instead..
    this.constructor.calAverageRatings(this.tour);
});
// 2-> ON DELETING AND UPDATING

// FindByIdAndUpdate and FindByIdAndDelete =>findOneAnd(Update/Delete)
// for these we do not have doc middleware but only query middleware is avaible..
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // here this-> point to currnt query
    // console.log(this);
    // execute the query to get current document.
    this.currentReviewDocument = await this.findOne();
    // console.log(currentReviewDocument);
    next();
});
reviewSchema.post(/^findOneAnd/, async function () {
    await this.currentReviewDocument.constructor.calAverageRatings(
        this.currentReviewDocument.tour
    );
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
