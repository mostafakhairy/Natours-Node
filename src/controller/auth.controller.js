const jwt = require('jsonwebtoken');
const User = require('./../models/user.model');
const catchAsync = require('./../helper/catch.error');
const AppError = require('./../helper/app.error');

const { promisify } = require('util');

const createToken = data => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN
  });
};
exports.signIn = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError('please provide email and password..!', 400));
  }
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );

  if (!user || !user.checkPassword(user.password, req.body.password)) {
    return next(new AppError('invalid username or password..!', 401));
  }
  const token = createToken({
    email: user.email,
    name: user.name,
    id: user._id
  });
  const cookieOption = {
    expires: new Date(
      Date.now + process.env.COOKIES_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOption.secure = true;
  }
  res.cookie('jwt', token, cookieOption);
  res.status(200).json({
    status: 'success',
    token
  });
});
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    // here we create new object instead of send the hole object from body coz maybe
    // someone will try to add role for him self as admin
    name: req.body.name,
    email: req.body.email,
    image: req.body.image,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt
  });
  const token = createToken({
    id: user._id,
    name: user.name,
    email: user.email
  });
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOption.secure = true;
  }
  res.cookie('jwt', token, cookieOption);
  //remove the password from response 
  user.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    data: user
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    return next(
      new AppError(
        'you are not logged in, please ty to logged in before request..',
        401
      )
    );
  }
  //get token from auth header
  const token = req.headers.authorization.split(' ')[1];
  // verify if token is correct and using promisify to make jwt verify async
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check if user still exist and not delete after token issued
  const user = await User.findById(decoded.id);
  if (!user) {
    next(new AppError('User is no more exist in system', 401));
  }
  //check if user change his password since token was issued
  if (user.isPasswordChanged(decoded.iat)) {
    next(
      new AppError('User changed his password, please try to login again', 401)
    );
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          'you don not have permission to access this resource..',
          401
        )
      );
    }
    next();
  };
};
