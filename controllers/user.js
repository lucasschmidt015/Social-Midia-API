// Sequelize models
const User = require("../models/user");

//Third-part packages
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//env
const {
  parsed: { TOKEN_SECRET },
} = require("dotenv").config();

//general
const utils = require("../utils/utils");

/**
 * Retrieves user data based on the specified user ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.getUser = async (req, res, next) => {
  // Extract user ID from request parameters
  const userId = req.params.userId;

  try {
    //Fetch user data from the database based on user ID
    const userData = await User.findByPk(userId);

    //Check if the user data exists
    if (!userData) {
      throw utils.createNewError(`No user founded for the id: ${userId}`, 401);
    }

    //Send successful response with user data
    return utils.sendResponse(res, 200, {
      success: true,
      data: userData,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a new user with the provided data.
 *
 * @param {Object} req - Express request object containing user data.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.createUser = async (req, res, next) => {
  //Validate user input using the User model's validation function
  const { error } = User.validate(req.body);

  //If validation error exists, send an error response
  if (error) {
    return next(
      utils.createNewError("Some data no metch.", 400, {
        success: false,
        error: error.details[0].message,
      })
    );
  }

  //Extract user data from the request body
  const name = req.body.name;
  const userName = req.body.userName;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;

  try {
    //Check if the email is already registered
    const emailExists = await User.findOne({
      where: { email: email },
    });

    //If email is already registered, send an error response
    if (emailExists) {
      throw utils.createNewError("This email is already registered.", 409);
    }

    //Check if the provided userName is already registered.
    const userNameExists = await User.findOne({
      where: { userName: userName },
    });

    //IF the provided userName is already registered, send an error message
    if (userNameExists) {
      throw utils.createNewError(
        "The provided userName is already registered.",
        409
      );
    }

    //Encrypt the user's password
    const encryptedPassword = await bcrypt.hash(password, 12);

    //Create a new user in the database
    const createdUser = await User.create({
      name,
      userName,
      email,
      password: encryptedPassword,
    });

    //Send a successful response with the created user
    return utils.sendResponse(res, 201, {
      success: true,
      user: createdUser,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Authenticates a user and generates a JWT token upon successful login.
 *
 * @param {Object} req - Express request object containing user login credentials.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.login = async (req, res, next) => {
  //Extract user login credentials from request body
  const email = req.body.email;
  const password = req.body.password;

  try {
    //Find the user in the database based on the provided email
    const user = await User.findOne({ where: { email: email } });

    //If no user is found, send an error response
    if (!user) {
      throw utils.createNewError("No user founded with this user E-mail.", 401);
    }

    //Compare the provided password with the hashed password stored in the database
    const isEqual = await bcrypt.compare(password, user.password);

    //If passwords do not match, send an error response
    if (!isEqual) {
      throw utils.createNewError("Wrong Password", 401);
    }

    //Generate a JWT accessToken for the authenticated user
    const accessToken = jwt.sign(
      {
        email: user.email,
        userId: user.id,
      },
      TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    //Generate a refreshToken for the authenticated user
    const refreshToken = jwt.sign(
      {
        email: user.email,
      },
      TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    //Send a successful response with the accessToken and the refreshToken
    return utils.sendResponse(res, 200, { accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

/** Allow the client to refresh its accessToken
 *
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.refreshToken = async (req, res, next) => {
  //Extract accessToken and refreshToken from the request body
  const { accessToken, refreshToken } = req.body;

  //If accessToken or refreshToken are not defined return an error response
  if (!accessToken || !refreshToken) {
    next(utils.createNewError("Some input data is missing.", 400));
  }

  //Check if the accessToken is still valid
  jwt.verify(accessToken, TOKEN_SECRET, (err, decoded) => {
    if (!err && decoded) {
      return next(utils.createNewError("accessToken is still valid", 400));
    }
  });

  try {
    //Check if the refresh token is still valid
    const decoded = jwt.verify(refreshToken, TOKEN_SECRET);

    //Extract the user email from the decoded object and search for the user
    const user = await User.findOne({ where: { email: decoded.email } });

    //If the user wasn't found, send an error response
    if (!user) {
      throw utils.createNewError("The user is no longer available.", 406);
    }

    //Generate a new access token with user data
    const newAccessToken = jwt.sign(
      {
        email: user.email,
        userId: user.id,
      },
      TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    //Return a success response with the new accessToken
    return utils.sendResponse(res, 200, { accessToken: newAccessToken });
  } catch (err) {
    if (!err.statusCode) {
      err.message = "Refresh token expired.";
      err.statusCode = 406;
    }
    next(err);
  }
};

/**
 * Initiates the password recovery process by sending a reset email to the user.
 *
 * @param {Object} req - Express request object containing user email.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.requestRecoverPassword = async (req, res, next) => {
  //Extract user email from request body
  const email = req.body.email;

  try {
    //Find the user in the database based on the provided email
    const user = await User.findOne({ where: { email: email } });

    //If no user is found, send an error response
    if (!user) {
      throw utils.createNewError("No user founded with this user E-mail.", 401);
    }

    //Generate a random token for the password reset
    const updateToken = await utils.createRandomToken();

    //Update user's password reset token and expiration time
    user.passwordResetToken = updateToken;
    user.passwordResetTokenExpiration = Date.now() + 300000;
    const savedUser = await user.save();

    //Send a password reset email to the user
    User.sendResetPasswordEmail(
      user,
      `http://localhost:3000/recover_password/${updateToken}`
    ); // This link here should be a link to your frontend

    //Send a success response
    return utils.sendResponse(res, 200, {
      success: true,
      message: "Reset email sent successfully.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles the password recovery process by updating the user's password.
 *
 * @param {Object} req - Express request object containing token and new password.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Promise<void>} - Asynchronous function.
 */
exports.handleRecoverPassword = async (req, res, next) => {
  //Extract token and new Password from the request body
  const { token, newPassword, newPasswordCheck } = req.body;

  //Check if new password or password confirmation is missing
  if (!newPassword || !newPasswordCheck) {
    return next(utils.createNewError("Some input data is missing."));
  }

  //Check if the new password and password confirmation match
  if (newPassword !== newPasswordCheck) {
    return next(utils.createNewError("Passwords do not match."));
  }

  try {
    //Find the user in the database based on the provided password reset token
    const user = await User.findOne({ where: { passwordResetToken: token } });

    //Check if the user or token is invalid or expired
    if (
      !user ||
      user.passwordResetToken !== token ||
      user.passwordResetTokenExpiration < Date.now()
    ) {
      throw utils.createNewError("Invalid or expired token", 400);
    }

    //Hash the new password and update the user information
    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = newHashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpiration = null;

    //Save the updated user information
    await user.save();

    //Send a successful response
    return utils.sendResponse(res, 200, "Password reset seccessful");
  } catch (err) {
    next(err);
  }
};

exports.searchUser = (req, res, next) => {}; //Implement this later
