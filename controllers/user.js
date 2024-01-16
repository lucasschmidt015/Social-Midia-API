const User = require("../models/user");
const bcrypt = require("bcryptjs");

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
      const error = new Error(`No user founded for the id: ${userId}`);
      error.statusCode = 401;
      throw new Error(error);
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  const { error } = User.validate(req.body);

  if (error) {
    console.log(error);
    const resError = new Error("Some data no metch.");
    resError.statusCode = 400;
    resError.data = { success: false, error: error.details[0].message };
    return next(resError);
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;

  try {
    const emailExists = await User.findOne({ where: { email: email } });

    if (emailExists) {
      const newError = new Error("This email is already registered.");
      newError.statusCode = 409;
      throw newError;
    }

    const encryptedPassword = await bcrypt.hash(password, 12);

    const createdUser = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    res.status(201).json({
      success: true,
      user: createdUser,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
