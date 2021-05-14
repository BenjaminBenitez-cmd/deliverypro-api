class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, res) => {
  const { statusCode, message } = err;
  if (statusCode === undefined) {
    return res.status(500).send({
      status: "error",
      statusCode: 500,
      message: "Opps, An error occured",
    });
  }
  res.status(statusCode).send({
    status: "error",
    statusCode,
    message,
  });
};

module.exports = {
  ErrorHandler,
  handleError,
};
