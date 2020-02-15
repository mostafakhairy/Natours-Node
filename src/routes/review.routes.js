const express = require('express');
const authController = require('./../controller/auth.controller');
const reviewController = require('./../controller/review.controller');
const routes = express.Router();

routes.route('/')
.get(authController.protect, reviewController.getReviews)
.post(authController.protect, reviewController.addReview);

module.exports = routes;