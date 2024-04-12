// const fs = require('fs');
const factory = require('./handlerFactory');
// Importing apiFeatures;
const APIFeatures = require('./../utils/apiFeatures');
// Importing tour model
const Tour = require('./../models/tourModel.js');
// Importing catchAsync funtion
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError.js');
// IMAGEUPLOAD
const multer = require('multer');
const sharp = require('sharp');

//1: MULTER STORAGE-> MEMORY BUFFER

const multerStorage = multer.memoryStorage();

//2: MULTER FILTER-> ALLOW ONLY IMAGES OF ALL FORMATE:

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

// 3: MIDDLEWARE FOR RESIZING IMGES-> SHARP

exports.resizeTourImages = async (req, res, next) => {
    // console.log(req.files);
    // if no coverimage of images=> move to next middleware
    if (!req.files.imageCover || !req.files.images) {
        return next();
    }
    // 1: PROCESSING COVERIMAGE

    // creating or updating filename .. tour-tourID-TimeStamp-cover.jpeg
    req.files.filename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.files.filename}`);

    // Store the filename in req.body for later use in database storage
    req.body.imageCover = req.files.filename; // This is the key change    

    // 2: PROCESSING IMAGES
    // since images is an array so create empty fields first and
    // then push back each file after processing
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
            // now push to the req.body.images so that it will update in db..
            req.body.images.push(filename);
        })
    );
    // console.log(
    //     'This is req.body form resizeTourImages middleware-> ',
    //     req.body
    // );

    next();
};

//4: MULTER UPLOAD-> UPLOAD THE PHOTO TO MEMORY BUFFER

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// 5: MILLDEWARE FOR UPLOADING THE PHOTO TO DISK
// NOTE: upload.files produces-> req.fields while uploead.single-> req.file

exports.uploadTourPhotos = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

// Alice middleware
exports.aliceMiddleware = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    (req.query.fields =
        'name,price,ratingsAverage,summary,difficulty,duration'),
        // console.log(req.query);
        next();
};

// loding tours data
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// middleware for id
// exports.checkID = (req, res, next, val) => {
//     console.log(`ID is ${val}`);
//     const id = +req.params.id;
//     const tour = tours.find((el) => el.id === id);
//     if (!tour) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID',
//         });
//     }
//     next();
// };

// exports.checkBody = (req, res,next) => {
//     // console.log(req.body);
//     const { name:Name, price: Price } = req.body;
//     console.log(Name,Price);
//     if (!Name || !Price) {
//         return res.status(400).json({
//             status: 'bad request',
//         });
//     }
//     next();
// };

exports.getTourStats = catchAsync(
    async (req, res, next) => {
        // try {
        console.log(req.params);
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.7 } },
            },
            {
                $group: {
                    _id: null,
                    numTours: { $sum: 1 },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                $sort: { avgRating: 1 },
            },
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats,
            },
        });
    }
    //     catch (err) {
    //         res.status(404).json({
    //             status: 'fail',
    //             message: err,
    //         });
    //     }
    // }
);
exports.getMonthlyPlan = catchAsync(
    async (req, res, next) => {
        // try {
        console.log(req.params.year);
        const year = req.params.year;
        const plan = await Tour.aggregate([
            { $unwind: '$startDates' },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTours: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $addFields: { month: '$id' },
            },
            {
                $project: { _id: 0 },
            },
            {
                $sort: { numTours: -1 },
            },
            {
                $limit: 6,
            },
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan,
            },
        });
    }
    //     catch (err) {
    //         res.status(400).json({
    //             status: 'fail',
    //             message: err,
    //         });
    //     }
    // }
);

// GET ALL TOURS

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//     // try {
//         // console.log(req.query);
//         // make swallow copy of queries
//         // let queryObj = { ...req.query };
//         // // console.log(queryObj);
//         // // simple filtering
//         // const excludedFields = ['page', 'fields', 'sort', 'limit'];
//         // excludedFields.forEach((el) => delete queryObj[el]);
//         // // advence filtering
//         // let queryStr = JSON.stringify(queryObj);
//         // // console.log(queryStr);
//         // queryStr = queryStr.replace(
//         //     /\b(gte|lte|gt|lt)\b/g,
//         //     (match) => `$${match}`
//         // );

//         // // console.log(typeof queryStr);
//         // queryObj = JSON.parse(queryStr);
//         // // console.log(queryObj);
//         // // execute above queries coz of complex should handle on return queries;
//         // let query = Tour.find(queryObj);
//         // // console.log(typeof query);

//         // // sorting
//         // // console.log(req.query.sort);
//         // if (req.query.sort) {
//         //     const sortBy = req.query.sort.split(',').join(' ');
//         //     // console.log(sortBy);
//         //     query = query.sort(sortBy);
//         // } else {
//         //     query = query.sort('-createdAt');
//         // }
//         // //limting field;
//         // // console.log(typeof query);
//         // // console.log(req.query.fields);
//         // if (req.query.fields) {
//         //     const fields = req.query.fields.split(',').join(' ');
//         //     query = query.select(fields);
//         // } else {
//         //     query = query.select('-__v');
//         // }
//         // //Pagination

//         // const page = +req.query.page || 1;
//         // const limit = +req.query.limit || 100;
//         // // console.log(typeof limit,limit);
//         // const skippedDocuments = (page - 1) * limit;
//         // // checking if page not exits
//         // // console.log(req.query.page);
//         // if (req.query.page||req.query.limit) {
//         //     const numTours = await Tour.countDocuments();
//         //     if (skippedDocuments >= numTours) {
//         //         throw new Error('The page DNE');
//         //     }
//         //     query = query.skip(skippedDocuments).limit(limit);
//         // }
//         // console.log(query);

//         // EXECUTE QUERY:
//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter()
//             .sort()
//             .limitFields()
//             .paginate();

//         const tours = await features.query;

//         // const tours = await query;
//         // console.log(tours);
//         res.status(200).json({
//             status: 'success',
//             results: tours.length,
//             data: {
//                 tours,
//             },
//         });
//     }
// //     catch (err) {
// //         next(err);
// //         // res.status(404).json({
// //         //     status: 'failed',
// //         //     message: err,
// //         // });
// //     }
// // }
// );

// GET TOURS
exports.getTour = factory.getOne(Tour, { path: 'review' });

// exports.getTour = catchAsync(async (req, res, next) => {
//     // try {
//         const tour = await Tour.findById(req.params.id).populate('review');
//                         // .populate('guides');
//         console.log('This is getTour route: ',tour);
//         if(!tour){
//             return next(new AppError('No tour found with this ID',404));
//         }
//         console.log(tour,req.params.id);
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour,
//             },
//         });
//     }
// //     catch (err) {
// //         next(err);
// //         // res.status(400).json({
// //         //     status: 'fail',
// //         //     message: err,
// //         // });
// //     }
// // }
// );

// CREATE TOUR
exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//     // try {
//         const newTour = await Tour.create(req.body);
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour,
//             },
//         });
//     }
// //     catch (err) {
// //         next(err);
// //         // res.status(400).json({
// //         //     status: 'fail',
// //         //     message: err,
// //         // });
// //     }
// // }
// );

// UPDATE TOUR

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res,next) => {
//     // try {
//         const updatedTour = await Tour.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             {
//                 new: true,
//                 runValidators: true,
//             }
//         );
//         if(!updatedTour){
//             return next(new AppError('No tour found with this ID',404));
//         }
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 updatedTour,
//             },
//         });
//     }
// //     catch (err) {
// //         console.log(err);
// //         res.status(404).json({
// //             status: 'fail',
// //             message: err,
// //         });
// //     }
// // }
// );

// DELETE TOUR

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res,next) => {
//     // try {
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour){
//             return next(new AppError('No tour found with this ID',404));
//         }
//         res.status(204).json({
//             status: 'success',
//             data: null,
//         });
//     }
// //     catch (err) {
// //         res.status(404).json({
// //             status: 'fail',
// //             messsage: err,
// //         });
// //     }
// // }
// )
// ;

// GET TOUR WITHIN ENDPOINT
// '/tours-within/:distance/center/:latlng/unit/:unit'
// '/tours-within/500/center/-34,45.45/unit/km'
exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    // console.log(radius);
    // if not lat or lng send error
    if (!lat || !lng) {
        return new AppError(
            'Please provide latitude and longitute in lat,lng formate',
            404
        );
    }
    // console.log(distance, lat, lng, unit);

    // find the tours which are satisfying the conditions..
    // user should be within the specified distance(calculated using lat lng and distance using special mongoose operator ie $centreSphere) from the startLocation of the tour
    // $centreSphere=> it take radius which is in radian so convert distance to radian..
    // NOTE: To find tours.. startLocation must be index to '2dsphere' otherwise $geoWithin will not works so do it in tourModel
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
    // next();
});

// Calculating the distances of all the tours from a certain point( current location(latlng) )..
// ENDPOINT: '/distance/-34,44/unit/ml'

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;

    if (!lat || !lng) {
        return new AppError(
            'Please provide the latitude and longitude in latlng formate',
            404
        );
    }
    // $geoNear => Outputs documents in order of nearest to farthest from a specified point.
    // You can only use $geoNear as the first stage of a pipeline.
    // You must include the distanceField option. The distanceField option specifies the field that will contain the calculated distance.
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/
    // pass an array of all stages of aggregation pipeline.. for geospecial aggregation there is only one single stage kn as $geoNear(always need to be first stage);
    // at least one of the field contain geospacial index here it is startLocation
    // if one field is index then geoNear will take that field and perform calculation..
    // if multiple field is indexed then we have to define key params to work this

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    // as a jeoJson
                    type: 'Point',
                    coordinates: [+lng, +lat],
                },
                distanceField: 'distance',
                // distance field will be calculated and all distances will stores here in meters
                // change it to km using distanceMultiplier
                distanceMultiplier: multiplier,
            },
        },
        // adding project stage to get only distance and tourName that is calculated above and ignoring all the other fields
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        results: distance.length,
        data: {
            data: distance,
        },
    });
});
// NOTE: ERROR-> "message": "$geoNear was not the first stage in the pipeline after optimization. Is optimization disabled or inhibited?",
// SOLUTION: Remove AGGREGATION MIDDLEWARE in tourModel.
