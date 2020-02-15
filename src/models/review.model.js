const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review is required']
    },
    rating: {
      type: Number,
      max: 5,
      min: 1
    },
    createAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'tour required for review']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user most be specified for review']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true } // to show un mapped fields or virtual fields
  }
);
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'email name'
  }).populate({ path: 'tour', select: 'name duration price' });
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
