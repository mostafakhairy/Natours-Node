const express = require('express');
const usersController = require('../controller/user.controller');
const authController = require('./../controller/auth.controller');
const routes = express.Router();

routes.route('/signUp').post(authController.signUp);
routes.route('/signIn').post(authController.signIn);
routes.route('/').get(authController.protect, usersController.getAllUsers);

routes
  .route('/:id')
  .patch(usersController.updateUser)
  .get(usersController.getUserById)
  .delete(usersController.deleteUser);

module.exports = routes;
