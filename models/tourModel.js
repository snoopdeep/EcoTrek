 const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// defining schema and model for tour
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must hava a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A name must be below 40 char'],
            minlength: [10, 'A name must be above 10 char'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        //Geospatial Data object...
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        //Embidding location documents
        locations: [
            { 
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        // Embedding tourGuides
        // guides:Array,
        //Referencing tourGuides
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be either easy/medium/difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1'],
            max: [5, 'Rating must be below 5'],
            set: (val) => Math.round(val * 10) / 10, // 4.6667=> 46.667=> 47/10=4.7
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1'],
            max: [5, 'Rating must be below 5'],
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            create: false,
        },
        startDates: [Date],
        secreteTour: {
            type: Boolean,
            default: false,
        },
    },

    // for displaying virtual property to user

    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// IMPROVING READ PREFORMANCE WITH INDEXING...
// before-> "nReturned": 3, and "totalDocsExamined": 9,=> go through all the doc and find.. time consuming ..
tourSchema.index({ price: -1, ratingsAverage: 1 });
// after->   "nReturned": 2, and "totalDocsExamined": 2,
// indexing takes a lot of resource(space) so be carefull while choose which to index..

// INDEXING startLocation for geoSpartial Queries..
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// VIRTUAL POPULATE review in tourSchema
// whenever we query for tour document review property will be there containing referances of all the review so populate it 
// it will not save in db..
tourSchema.virtual('review', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// DOCUMENTS MIDDLEWARE
// 1) pre save hook
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
// Imbadding guide doc into tour
// tourSchema.pre('save',async function(next){
//     const guidePromises= this.guides.map(async id=>await User.findById(id));
//     this.guides= await Promise.all(guidePromises);
//     next();
// })
// // 2) pre save hook 2nd

// tourSchema.pre('save',function(next){
//     console.log('Document is loding...');
//     next();
// });
// // 3) post save hook
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })

// QUERY MIDDLEWARE;
tourSchema.pre(/^find/, function (next) {
    this.find({ secreteTour: { $ne: true } });
    this.starT = Date.now();
    next();
});
tourSchema.post(/^find/, function (docs, next) {
    // console.log(`Query took ${Date.now() - this.starT} milliseconds!!`);
    next();
});
//Populate guides in tours middleware
tourSchema.pre(/^find/, function (next) {
    // console.log('this is populate middleware of tour model...');
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    }),
        next();
});

// AGGREGATION MIDDLEWARE
// commenting out this middleware coz of $geoNear query.. cos it must be first in aggregation pipeline..

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({
//         $match: { secreteTour: { $ne: true } },
//     });
//     console.log('this is match stage of aggregation pipeline of tourModel');
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
