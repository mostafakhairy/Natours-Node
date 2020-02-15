const mongoose = require('mongoose');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      unique: [true, 'name should be unique'],
      trim: true,
      maxlength: [50, 'name length must be less than 50 character.'],
      minlength: [1, 'name length must be more than 1 character.']
      // validate: [validator.isAlpha, 'name should be alpha']
    },
    duration: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: [true, 'price is required']
    },
    rating: {
      type: Number,
      default: 4.0,
      min: [1, 'rating must be above 0'],
      max: [5, 'rating must be less or equal 5']
    },
    maxGroupSize: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty should be easy or medium or difficult'
      }
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'discount price value {VALUE} should be less than price '
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'the tour should have description']
    },
    imageCover: {
      type: String,
      required: true
    },
    images: [String],
    createdDate: {
      type: Date,
      default: Date.now,
      select: false // to not get field in select statement
    },
    startDates: [Date],
    secretTour: Boolean,
    // guides: {
    //   type:  mongoose.Schema.ObjectId,
    //   ref: 'User'
    // }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true } // to show un mapped fields or virtual fields
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  // this like define field but annotated with NotMapped in c#
  return this.duration / 7;
});
//create middleware or hooks like trigger in sql before save and after
tourSchema.pre('save', next => {
  console.log('pre save'); //this will call only when using save or create
  next();
});
tourSchema.post('save', (doc, next) => {
  console.log('after save doc', doc);
  next();
});

// tourSchema.pre('find', next => { // this will not working with findOne or any other find
//   console.log('pre find');
//   next();
// });
//we can use regular expression to match any hook has find or
// create hooks for each find method and this is not the
//bes practices
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  console.log('pre find');
  next();
});
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // to not repeat code for each aggregation
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

//process.argv to get array of what u  write in command

/*const newTour = new Tour({
  name: 'Round in river',
  price: 300.5,
  rating: 4.5
})
  .save()
  .then(doc => console.log(doc));*/

//for create data validation we can use validator library
