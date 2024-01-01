const { errorCodes } = require("../config/errorCodes.js");

const errorHandler = (err, req, res) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {
    case errorCodes.VALIDATION_ERROR:
      return res.json({
        title: "Validation Failed!",
        message: err.message,
      });
      break;
    case errorCodes.NOT_FOUND:
      return res.json({
        title: "Not Found",
        message: err.message,
      });
    case errorCodes.UNAUTHORIZED:
      return res.json({
        title: "Unauthorized",
        message: err.message,
      });
    case errorCodes.FORBIDDEN:
      return res.json({
        title: "Forbidden",
        message: err.message,
      });
    case errorCodes.INTERNAL_SERVER_ERROR:
      return res.json({
        title: "Internal Server Error",
        message: err.message,
      });
    default:
      break;
  }
};

module.exports = errorHandler;
