const express = require('express');
const app = express();
const morgan = require('morgan');
// const cookie_parser = require('co okie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes.js');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');

// SETTING EXPRESS TEMPLETING ENGINE-> PUG

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// PARSERS

// using cookie-parser to parse cookie from incoming req from client for authorization perpose
app.use(cookieParser());
// parsing the data coming from form ..
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HELMET MIDDLEWARE
app.use(helmet());

// MIDDLEWARES
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: 'Too many request from this IP. Please try again after an hour',
    // store: ... , // Redis, Memcached, etc. See below.
});
app.use('/api', limiter);

// setting up my own middleware
app.use((req, res, next) => {
    console.log('Hello from the middleware!!!');
    // console.log(x);
    next();
});

// adding time stemp to the request
app.use((req, res, next) => {
    req.requestTimee = new Date().toISOString();
    // console.log('This is requrest ',req);
    // console.log('This is the request header ', req.headers);
    console.log('This is the cookie from client request', req.cookies);
    next();
});

// creating individual router of tours and users
// 1) Create Router 2) Connect to the route 3) Use the router or call it

// defining route for pug
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);

// DEFININING A MIDDLEWARE FOR UNWANTED/ UNDEFINED ROUTES/REQUEST
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`,
    // });
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.statusCode = 404;
    // err.status = 'fail';
    // next(err);
    // USING AppError CLASS
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// GLOBAL MIDDLEWARE FOR ALL ERROR HANDLING
app.use(globalErrorHandler);

module.exports = app;
