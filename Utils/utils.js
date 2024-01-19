const crypto = require("crypto");

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
  createRandomToken: () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(32, (error, buffer) => {
        if (error) {
          reject("Something went wrong");
        } else {
          const token = buffer.toString("hex");
          resolve(token);
        }
      });
    });
  },
};

module.exports = utils;
