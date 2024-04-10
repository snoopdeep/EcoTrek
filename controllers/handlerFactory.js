const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('No document found with this ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

// exports.deleteTour = catchAsync(async (req, res,next) => {

//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour){
//             return next(new AppError('No tour found with this ID',404));
//         }
//         res.status(204).json({
//             status: 'success',
//             data: null,
//         });
//     }
// )
// ;

// UPDATE FACTORY FUNCTION
exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError('No documet found with this ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });
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

// CREATE FACTORY FUNCTION

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: doc,
            },
        });
    });

// GET ONE

exports.getOne = (Model, popObject) =>
    catchAsync(async (req, res, next) => {
        let qurey = Model.findById(req.params.id);
        if (popObject) qurey = qurey.populate(popObject);
        const doc = await qurey;
        // console.log('This is getdoc route: ',doc);
        if (!doc) {
            return next(new AppError('No document found with this ID', 404));
        }
        // console.log(doc,req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

// GET ALL

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // TO ALLOW FOR NESTED GET REVIEWS ON TOUR (hack..)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const doc = await features.query
        // .explain();
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
