const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a Tour!'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Booking must have a price!'],
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price!'],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    paid: {
        type: Boolean,
        default: true,
    },
});

// POPULATING THE TOUR AND USER WHEN EVER A QUERY..
// nested populated... takes time but since it will not happnen so frequenty so its okay..
// we only want name of tour...
bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name',
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
