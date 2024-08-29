const logger = require("../services/logger_service");

const errorHandler = (res, error) => {
  logger.error(error);
  res.status(400).send({ error: error.message });
};

module.exports = {
  errorHandler,
};
