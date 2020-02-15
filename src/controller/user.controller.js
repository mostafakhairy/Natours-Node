const jwt = require('jsonwebtoken');
const User = require('./../models/user.model');
const catchAsync = require('./../helper/catch.error');
const ApiExtensions = require('./../helper/api.extensions');

exports.getAllUsers = catchAsync(async (req, res) => {
  const apiExtensions = new ApiExtensions(User.find(), req.query)
    .filter()
    .sort()
    .paging()
    .limitFields();
  const users = await apiExtensions.query;
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users
  });
});
exports.getUserById = (req, res) => {
  res
    .status(500)
    .json({ status: 'Error From My Server', data: 'Not Defined Yet' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'Error From My Server', data: 'Not Defined Yet' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'Error From My Server', data: 'Not Defined Yet' });
};
