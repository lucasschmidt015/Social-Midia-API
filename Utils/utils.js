const crypto = require("crypto");

//Define a utility object containing various helper functions
const utils = {
  //Function to create a new custom error
  createNewError: (message, statusCode = 500, data = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (data) {
      error.data = data;
    }

    return error;
  },
  //Function to send an HTTP response with a specified status code and data
  sendResponse: (res, statusCode, data) => {
    return res.status(statusCode).json(data);
  },
  //Function to create a random token using the crypto module
  createRandomToken: () => {
    return new Promise((resolve, reject) => {
      //Generate random bytes using crypto module
      crypto.randomBytes(32, (error, buffer) => {
        if (error) {
          reject("Something went wrong");
        } else {
          //Convert the buffer to a hexadecimal token
          const token = buffer.toString("hex");
          resolve(token);
        }
      });
    });
  },
};

//Export the utility object for use in other parts of the application
module.exports = utils;
