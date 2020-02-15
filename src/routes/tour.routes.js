const express = require('express');
const toursController = require('../controller/tour.controller');
const authController = require('./../controller/auth.controller');
const routes = express.Router();

//create middleware when route has id as filters in ASPWebAPi but for specific route
// routes.param('id', toursController.checkId);

routes.route('/tour-stats').get(toursController.tourStats);
routes.route('/monthly-tours/:year').get(toursController.monthlyPlan);
routes
  .route('/get-cheapest-5')
  .get(toursController.getCheapest5, toursController.getAllTours);
routes
  .route('/')
  .get(toursController.getAllTours)
  //call function before goto function route
  .post(toursController.addTour);

routes
  .route('/:id')
  .patch(toursController.updateTour)
  .get(toursController.getTourById)
  .delete(authController.protect, authController.restrictTo(['admin', 'lead-guide']), toursController.deleteTour);

module.exports = routes;
