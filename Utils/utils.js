const utils = {
  createNewError: (message, statusCode = 500, data = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (data) {
      error.data = data;
    }

    return error;
  },
  sendResponse: (res, statusCode, data) => {
    return res.status(statusCode).json(data);
  },
};

module.exports = utils;
