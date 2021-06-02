const { ErrorHandler } = require("./Error");
const { NOT_FOUND } = require("./ErrorCodes");

const checkResults = (response, message) => {
  if (response.rows[0] === undefined) {
    throw new ErrorHandler(NOT_FOUND, message || "Resource not found");
  }
};

module.exports = checkResults;
