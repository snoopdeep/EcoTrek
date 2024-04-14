const { promisify } = require('util');
const AppError = require('../utils/AppError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const crypto = require('crypto');
// NO NEED OF sendEmail-> i created an Email class now
// const sendEmail = require('./../utils/mail');
const Email = require('./../utils/mail');

const jwt = require('jsonwebtoken');
const brycpt = require('bcryptjs');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    // console.log(
    //     'This is create and send Token function from authController.js'
    // );
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // secure:true,
        // httpsOnly.. we cant manipulate the cookie
        httpsOnly: true,
    };
    // SENDING TOKEN THOUGH COOKIE
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    // console.log('This is the res after attaching cookie to it..', res.body);
    // remove password from response
    user.password = undefined;
    // console.log(
    //     'This is the res after removing response from response..',
    //     res.body
    // );
    res.status(statusCode).json({
        status: 'success',
        // sending token also in response coz postman will automatically fetch it form test script.. not a good way to send token but..
        token,
        data: user,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        // CREATE NORMAL USER.. TO AVOID MAKING ADMIN TO EVERYONE
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangeAt: req.body.passwordChangeAt,
        role: req.body.role,
    });
    // console.log('This is from signup middleware and newUser is ', newUser);
    // SENDING A WELCOME EMAIL ON SINGUP -> url will point to profile page of user where he/she can upload photo as mentaion in template
    // console.log('this is from signup');
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    // console.log('this is signup... modelCreate...');
    // console.log(req.body.passwordConfirm);
    // CREATING JWT TOKENS
    createSendToken(newUser, 202, res);
    // const token = signToken(newUser._id);
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN,
    // });
    // res.status(202).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });
    // console.log(req.body.passwordConfirm);
});

// SIGN IN
exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password exist
    if (!email || !password) {
        return next(new AppError('Enter email or password!', 404));
    }

    //2: check if user exit and password is correct
    const user = await User.findOne({ email }).select('+password');
    // console.log(user);
    // const correct=await user.correctPassword(password,user.password);
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Enter correct email or password', 401));
    }

    //3: everything ok=> send token to client
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         token,
    //     },
    // });
});

// REQUEST AUTHORIZATION:
// to access a specifit route user must be login...
exports.protect = catchAsync(async (req, res, next) => {
    console.log('Hello from the protect middleware..');
    let token;
    // console.log('This is from protect middleware..');
    //1: getting token and check if it exists or not
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // taking jwt from the cookies of browser..
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // console.log('This is from authorization middleware... token is->', token);
    if (!token) {
        return next(
            new Error(
                'You are not logged in! Please login to use resources.',
                401
            )
        );
    }

    //2: validating token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3:check if user still exits or not
    const currentUser = await User.findById(decoded.id);
    // console.log('This is from login middleware..');

    if (!currentUser) {
        return next(
            new Error('The user belonging to token no longer exist.', 401)
        );
    }

    //4:check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new Error(
                'User recently changed password. Please login again!',
                401
            )
        );
    }

    //5: Grant access to protected route
    // creating user property on req object which contain the currentUser information...
    req.user = currentUser;
    //5:THER IS LOGGEDIN USER
    // NOW SET user VARIABLE ON res.locals WHICH WILL BE ACCESSABLE EVERYWHERE IN PUG TEMPLATE
    res.locals.user = currentUser;
    console.log('Hello from the protect middleware.. i am ending.. ');
    console.log(currentUser);
    console.log('res is -> ',req.user);
    console.log('res is -> ',res.locals);
    next();
});

// SIGNOUT : this will be called by axios and send to the api

exports.logout = (req, res, next) => {
    // console.log('Hello from logOut middleware.. I am called by axios');
    //1 override the cookie ie same name with different jwt token..
    res.cookie('jwt', 'thisisjwtTokenHeHeHe', {
        expires: new Date(Date.now() + 10 * 1000), // 10 sec tak ke bad delete ho jayegi// invalid.
        httpsOnly: true,
    });

    // Or we can clear the cookie as well and send the response without cookie to the axios
    // res.clearCookie('jwt')

    // 2: send the res to the api
    res.status(200).json({ status: 'success' });

    // now this will be go through isLoggedIn middleware so it will validate the token
    // so isLoggedIn through the error which is handle by catchAsync and we will get error
    // insted of loggedOut
};

// isLoggedIn middleware for CONDITIONAL RENDERING-> only check if a user is logged in or not '
// if loggedIn then set a property : res.locals.user = currentUser; ie user which is accessable every where in template
// user contains the current loggein user information.
// since after logged out we have cookie with invalid jwt so this middleware will through error..
// so remove catchAsync block instead handle error locally
// if loggedout-> isLoggedIn through error-> call next() in catch block..
exports.isLoggedIn = async (req, res, next) => {
    let token;
    //1: getting token from cookie only coz req comming from client not form api and check if it exists or not
    if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;
            // console.log(
            //     'This is from isLoggedIn middleware... token from cookie is->',
            //     token
            // );
            if (!token) {
                return next();
            }

            //2: validating token

            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );

            //3:check if user still exits or not
            // console.log('decoded-> ', decoded);
            const currentUser = await User.findById(decoded.id);
            // console.log('this is loggedIN middleware and current User is ->');
            if (!currentUser) {
                return next();
            }

            //4:check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            //5:THER IS LOGGEDIN USER
            // NOW SET user VARIABLE ON res.locals WHICH WILL BE ACCESSABLE EVERYWHERE IN PUG TEMPLATE
            res.locals.user = currentUser;
            return next(); // to prevent calling next() two time in this same middleware
        } catch (err) {
            return next();
        }
    }
    // ELSE NO LOGGED IN USER SIMPLY call next middelware
    next();
};

exports.restrictTo = (...roles) => {
    console.log('Hello from the restrict to middleware..');
    // console.log([roles]);
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

// FORGET PASSWORD
exports.forgetPassword = catchAsync(async (req, res, next) => {
    //1: find user form email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('No user found corresponding to this email', 400)
        );
    }

    //2: create a reset token => instance method
    const resetToken = user.createPasswordResetToken();
    await user.save({ validationBeforeSave: false });

    //3: send token through the mail to the user
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // USING NODEMAILER TO SEND->
    // const message = `Forgot your Password? Submit a PATCH request with your password and passwordConfirm to: ${resetURL}\n Else Ignore this message.`;
    // await sendEmail({
    //     email: req.body.email,
    //     subject: 'Your Password Reset Token Will Valid for 10 min only',
    //     message,
    // });

    // USING MAIL CLASS TO SEND RESET TOKEN..
    // console.log(
    //     'This is from forgetPassword middleware and resetUrl is ',
    //     resetURL
    // );
    await new Email(user, resetURL).sendResetPassword();
    res.status(200).json({
        status: 'success',
        message: 'Token send to email',
    });
});

// RESET PASSWORD:
exports.resetPassword = catchAsync(async (req, res, next) => {
    //1: GET THE USER BASED ON REQUEST TOKEN
    const hasedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hasedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    //2:if token has not expired  and there is user then set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }
    // console.log(
    //     'This is from the resetPassword middleware and user find is,',
    //     user
    // );
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // i want to run validator to check password===passwordConfirm so no {alidationBeforeSave: false}
    await user.save();
    //3: UPDATE CHANGED PASSWORDAT PROPETY FOR USER;
    // USE MIDDLEWARE

    //4:log the user in and send jwt token;
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});

// UPDATE PASSWORD
//
exports.updatePassword = catchAsync(async (req, res, next) => {
    //1: get user from collection (my current user is in req.user.. see authorization code for this)
    // console.log('This is from updataPassword middleware...');
    const user = await User.findById(req.user.id).select('+password');
    // console.log('User is ->', user);
    // for login we will add middleware to check so no need;
    // if (!user) {
    //     return next(
    //         new AppError('Please log in first to update password', 400)
    //     );
    // }
    //2: check if posted password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(
            new AppError(
                'Current password is not match with old password. Please try again.',
                401
            )
        );
    }

    //3: if yes => update password
    // console.log(user.password,user.passwordConfirm);
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // console.log('This is after saving the new password to db..');

    //4: log in user back=> send jwt token
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token,
    // });
});
