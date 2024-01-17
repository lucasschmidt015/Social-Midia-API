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
  const userId = req.params.userId;

  try {
    const userData = await User.findByPk(userId);

    if (!userData) {
      throw utils.createNewError(`No user founded for the id: ${userId}`, 401);
    }

    return utils.sendResponse(res, 200, {
      success: true,
      data: userData,
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  const { error } = User.validate(req.body);

  if (error) {
    return next(
      utils.createNewError("Some data no metch.", 400, {
        success: false,
        error: error.details[0].message,
      })
    );
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;

  try {
    const emailExists = await User.findOne({ where: { email: email } });

    if (emailExists) {
      throw utils.createNewError("This email is already registered.", 409);
    }

    const encryptedPassword = await bcrypt.hash(password, 12);

    const createdUser = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    return utils.sendResponse(res, 201, {
      success: true,
      user: createdUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw utils.createNewError("No user founded with this user E-mail.", 401);
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      throw utils.createNewError("Wrong Password", 401);
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id,
      },
      TOKEN_SECRET, // My secret
      {
        expiresIn: "1h",
      }
    );

    return utils.sendResponse(res, 200, { token: token, userId: user.id });
  } catch (err) {
    next(err);
  }
};

exports.requestRecoverPassword = async (req, res, next) => {
  const email = req.body.email;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      throw utils.createNewError("No user founded with this user E-mail.", 401);
    }

    // I stoped here <--------------
  } catch (err) {
    next(err);
  }
};

exports.handleRecoverPassword = (req, res, next) => {};

//It might be a good idea to implement a method to update user data <-------------------
//Implement a method to reset the user's password
