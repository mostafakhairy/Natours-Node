const dotenv = require('dotenv');
//set config file
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

//handle sync errors like console.log(x); x is not defined
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1); // 1 mean fail
});

//connect to db
const dbCon = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

//local db process.env.DATABASSE_LOCAL
mongoose
  .connect(dbCon, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('connected to mongo db');
  });

//run server
const port = process.env.PORT || 1000;
const server = app.listen(port, () => {
  console.log('server is running and waiting your request ');
});

//handle error which is out express and mongoose like connect to db
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // 1 mean fail
  });
});
