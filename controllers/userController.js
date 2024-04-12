// Route handlers for users
const Model = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
// importin multer for file uploading
const multer = require('multer');
// for image Processing...
const sharp = require('sharp');

// MULTER STORAGE-> WHERE UPLOADE FILE WILL BE SAVE

// 1: saving to diskStorage in a specific path
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // on error-> null on success-> destination will be 'public/img/users'
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-ID-TimeStamp
//         const ext = file.mimetype.split('/')[1]; // this is extension ie .jpeg .jpg etc
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });

// 2: saving to ie buffer coz i have to imageProcessing then save to disk..
const multerStorage = multer.memoryStorage();

// MULTER FILTER-> allow only image to upload..
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

// MIDDLEWARE FOR RESIZING IMGAES..
exports.resizeUserImgage = async(req, res, next) => {
    // console.log('This is req object received by resizeUserImages',req);
    // console.log('This is req.file-> ',req.file);
    if (!req.file) {
        return next();
    }
    // console.log(
    //     'This is resizeUserImage middleware and req.file.buffer is .. ',
    //     req.file.buffer
    // );
    // creating filename property with correct name ie user-ID-TimeStamp
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    // console.log('filename-> ',req.file.filename);
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);
    next();
};

// NOW FINALLY UPLOAD THE PHOTO
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
// console.log('This is upload from multer..', upload);

// MIDDLEWARE FOR UPLOADING PHOTO TO THE DISK/MEMORY FROM API
exports.uploadUserPhoto = upload.single('photo');

const filterFields = (obj, ...fields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (fields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

// GET ALL USERS

exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res) => {
//     const users = await Model.find();
//     res.status(200).json({
//         status: 'success',
//         result: users.length,
//         data: {
//             user: users,
//         },
//     });
// });

// GET ME ENDPOINT
// set userId to the user params and call getUsers on it..

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// exports.getMe = catchAsync(async (req, res, next) => {
//     const user = await User.findById(req.user.id);
//     res.status(200).json({
//         status: 'success',
//         data: {
//             data: user,
//         },
//     });
// });

//UPDATE ME

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log('this is after uploadUserPhoto middleware');
    // console.log('req.file is ', req.file);
    // console.log('req.body is ', req.body);

    //1: user not allowed to change password to this root
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password change. Please send patch request to /updatePassword',
                400
            )
        );
    }

    //2: user only allowed to change certain fields only so filter the object
    const filterdBody = filterFields(req.body, 'name', 'email');
    // console.log(filterdBody);
    if(req.file)filterdBody.photo=req.file.filename;

    //3: change the field and send response.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

// DELETE CURRENT USER

exports.deleteMe = catchAsync(async (req, res, next) => {
    // find the current user and change active property to false;
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(202).json({
        status: 'success',
        data: null,
    });
});

// CREATE USER

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, please use signup instead...',
    });
};

// exports.createUser=factory.createOne(User); 

// UPDATE USER

// Do not try to updata password via this route...
exports.updateUser = factory.updateOne(User);
// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined',
//     });
// };

// DELETE USER

exports.deleteUser = factory.deleteOne(User);
// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined',
//     });
// };

// GET USER

exports.getUser = factory.getOne(User);

// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined',
//     });
// };
