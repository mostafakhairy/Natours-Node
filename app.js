const express = require('express');
const morgan = require('morgan');
const tourRoute = require('./src/routes/tour.routes');
const userRoute = require('./src/routes/user.routes');
const reviewRoute = require('./src/routes/review.routes');
const globalErrorHandler = require('./src/filters/global-error-handler');
const AppError = require('./src/helper/app.error');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const app = express();
const hpp = require('hpp');

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// to secure http by adding some headers
app.use(helmet());

//to be able to get request body
app.use(express.json({ limit: '10kb' }));

//create middleware: middleware has access to req, res and next function and ordering is matter when we use it
//like filter in WebApi
app.use((req, res, next) => {
  req.dateMiddleWare = new Date().toISOString();
  next();
});

// limit request for period of time
const limiter = new rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'only limit requests allowed during this time'
});
app.use('/api', limiter);

//data sanitization against NoSql query injection like use email //"email":{"$gt": ""},
app.use(mongoSanitize());

//data sanitization against xss which html with javascript
app.use(xss());

//prevent http paramter pollution like use $sort = field1 & $sort = field2
app.use(
  hpp({
    whitelist: ['duration', 'price', 'durationWeeks'] // allow some fields for double sort
  })
);

// to server static html
app.use(express.static(`${__dirname}/public`));

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/:name?', getTourById);
// app.post('/api/v1/tours', addTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

//create middle ware for not found routes, this middleware should be last route in ordering
app.all('*', (req, res, next) => {
  const error = new AppError(`Can't find ${req.originalUrl} on my server`, 404);
  next(error);
});

// using middleware for error handling when we use callback function with
//4 params express will assume that its this middleware is global error handler
app.use(globalErrorHandler);
module.exports = app;
