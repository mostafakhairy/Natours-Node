const AppError = require('./../helper/app.error');
developmentError = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack
  });
};
productionError = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    res.status(500).json({
      status: error.status,
      message: 'Something went wrong..!'
    });
  }
};
const handleCastDbError = err => {
  err.message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(err.message, 400);
};
const handleDuplicateCodeDb = err => {
  const value = err.errmsg.match(/"(.*?(?<!\\))"/)[0];
  console.log(value);
  err.message = `Duplicate field error please change value ${value}`;
  return new AppError(err.message, 400);
};
const handleJWTError = () =>
  new AppError('invalid token please try to login again..', 401);

const handleJWTExpiry = () =>
  new AppError('token is expired please ty to login again', 401);

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'fail';
  const env = process.env.NODE_ENV;
  if (env === 'development') {
    developmentError(error, res);
  } else if (env === 'production') {
    let err = { ...error };
    if (err.name == 'CastError') err = handleCastDbError(err);
    if (err.code === 11000) err = handleDuplicateCodeDb(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiry();
    productionError(err, res);
  }

  next();
};
