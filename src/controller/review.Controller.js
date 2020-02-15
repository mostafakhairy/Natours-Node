const Review = require('../models/review.model');
const ApiExtensions = require('./../helper/api.extensions');
const catchAsync = require('./../helper/catch.error');

exports.getReviews = catchAsync(async(req, res) => {
    const reviews = await Review.find()
    res.status(200).json({
        status: 'success',
        data: reviews
    }
    )
})
exports.addReview =catchAsync(async (req, res) => {
    const review = await Review.create(req.body);
    res.status(200).json({
        status: 'success',
        data: review
    })
})