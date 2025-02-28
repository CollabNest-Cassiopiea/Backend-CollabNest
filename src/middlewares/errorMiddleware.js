const { handleError } = require('../utils/errorHandler');

const errorMiddleware = (err, req, res, next) => {
  handleError(err, res);
};

module.exports = errorMiddleware;
