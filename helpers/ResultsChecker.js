const { ErrorHandler } = require("./Error");
const { NOT_FOUND } = require("./ErrorCodes");

const checkResults = (response) => {
  if (response.rows[0] === undefined) {
    throw new ErrorHandler(NOT_FOUND, "Delivery Not Found");
  }
};

module.exports = checkResults;