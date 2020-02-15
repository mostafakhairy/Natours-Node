module.exports = fn => {
  // catching error and send next to catch the error in global error handling
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
