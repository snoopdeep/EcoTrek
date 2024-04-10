"use strict";

var express = require('express');

var app = express();

var morgan = require('morgan');

var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRoutes');

var reviewRouter = require('./routes/reviewRoutes');

var viewRouter = require('./routes/viewRoutes');

var AppError = require('./utils/AppError');

var globalErrorHandler = require('./controllers/errController');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var path = require('path'); // SETTING EXPRESS TEMPLETING ENGINE-> PUG


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // GLOBAL MIDDLEWARE
// serving static files

app.use(express["static"](path.join(__dirname, 'public'))); // HELMET MIDDLEWARE

app.use(helmet()); // MIDDLEWARES

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  limit: 100,
  // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7',
  // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers.
  message: 'Too many request from this IP. Please try again after an hour' // store: ... , // Redis, Memcached, etc. See below.

});
app.use('/api', limiter); // setting up my own middleware

app.use(function (req, res, next) {
  console.log('Hello from the middleware!!!'); // console.log(x);

  next();
}); // adding time stemp to the request

app.use(function (req, res, next) {
  req.requestTimee = new Date().toISOString();
  console.log('This is the request header ', req.headers);
  next();
}); // creating individual router of tours and users
// 1) Create Router 2) Connect to the route 3) Use the router or call it
// defining route for pug

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter); // DEFININING A MIDDLEWARE FOR UNWANTED/ UNDEFINED ROUTES/REQUEST

app.all('*', function (req, res, next) {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);
  // USING AppError CLASS
  next(new AppError("Can't find ".concat(req.originalUrl, " on this server!"), 404));
}); // GLOBAL MIDDLEWARE FOR ALL ERROR HANDLING

app.use(globalErrorHandler);
module.exports = app;