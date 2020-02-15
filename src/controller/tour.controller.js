const Tour = require('../models/tour.model');
const ApiExtensions = require('./../helper/api.extensions');
const catchAsync = require('./../helper/catch.error');
const AppError = require('./../helper/app.error');
exports.getCheapest5 = (req, res, next) => {
  (req.query.limit = 5), (req.query.fields = 'rating name price');
  req.query.sort = 'price';
  next();
};
exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiExtensions = new ApiExtensions(Tour.find(), req.query)
    .filter()
    .sort()
    .paging()
    .limitFields();
  //get tours
  const tours = await apiExtensions.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});
exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('no data found with this id', 404)); // here we should return next and coz it has paramter
    // it will be catch in global error handler
  }
  res.status(200).json({
    status: 'success',
    data: tour
  });
});
exports.addTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: tour
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  });
  res.status(200).json({
    status: 'success',
    data: tour
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
exports.tourStats = catchAsync(async (req, res, next) => {
  const result = await Tour.aggregate([
    {
      $match: { price: { $gt: 450 } }
    },
    {
      $group: {
        _id: '$difficulty', // set to null if we wanna group all data
        //we can use {$toUpper: '$difficulty'} to change format
        sumTour: { $sum: 1 },
        sumPrice: { $sum: '$price' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { averagePrice: 1 } // 1 mean that we  wanna order ascending, -1 descending
    },
    {
      $match: { _id: { $ne: null } }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: result
  });
});
exports.monthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const result = await Tour.aggregate([
    {
      $unwind: '$startDates' //destruct array so this operator will repeat tour for each date in array
    },
    {
      $match: {
        startDates: {
          $gt: new Date(`${year}-01-01`),
          $lt: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 } // 0 mean hide field 1 mean show
    },
    {
      $sort: { month: -1 } // 1 mean ascending -1 descending
    },
    {
      $limit: 6 // take only 6 results
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: result
  });
});
