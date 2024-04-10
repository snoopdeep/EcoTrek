const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 404);
};
const handleCodeErrorDB = (err) => {
    // const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const value = err.keyValue.name;
    console.log(value);
    const message = `Duplicate field value "\ ${value} \". Please use another value`;
    return new AppError(message, 400);
};
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid Input Data: ${errors.join(' .')}`;
    console.log(message);
    return new AppError(message, 400);
};
const handleJWTError = () =>
    new AppError('Invalid Token. Please login again!', 401);
const handleJWTExpireError = () =>
    new AppError('Token got expired.Please login again.', 401);

// Development Error
// -> when the url starts with /api/v1/.. => api error so send all the information about errror
// -> when url does not contaion /api=> render page
const sendErrorDev = (err, req, res) => {
    // API error
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            error: err,
            status: err.statusCode,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Rendering the error page
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
    }
};
const sendErrorPro = (err,req, res) => {
    console.log('this is sendErrorPro function');
    console.log(req.originalUrl);
    // A: API
    if (req.originalUrl.startsWith('/api')) {
        // Operational: Trusted Error-> send message to client,
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.statusCode,
                message: err.message,
            });
        } else {
            // very carefull to exposed the error that you dont know so console.log() first and then decide.. 
            console.error('Error', err);
            res.status(500).json({
                status: 'error',
                message: 'something went very wrong!',
            });
        }
    }
    // Render page..
    else {
        // Operational: Trusted Error-> send message to client..
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message,
            });
        }
        // send very genric message..
        // very carefull to exposed the error that you dont know so console.log() first and then decide.. 

        else {
            console.error('Error', err);
            res.status(500).render('error',{
                title: 'Something went wrong!',
                msg: 'something went very wrong! Please try again later!!',
            });
        }
    }
};
// global error handling middleware .. error is comming form AppErrorClass to handle here..
module.exports = (err, req, res, next) => {
    console.log('This is from errController: Error is ->');
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        console.log('this is from development err controller..');
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        console.log('this is from production err controlller..');
        // 1) invalid db id error-> mark it production error with a custom message;
        let error = { ...err };
        error.message = err.message;
        console.log(error);
        // IF INVALID ID
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        // IF DUPLICATE FIELDS
        if (err.code === 11000) error = handleCodeErrorDB(error);
        // VALIDATION ERROR
        if (err.name === 'ValidationError')
            error = handleValidationError(error);
        // HANDLING REQUEST(TOKEN) ERROR
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpireError();
        sendErrorPro(error,req, res);
    }
    next();
};
