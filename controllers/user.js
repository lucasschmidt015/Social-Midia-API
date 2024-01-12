const User = require("../models/user");

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
      return res.status(404).json({
        success: false,
        error: `No user founded for the id: ${userId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.createUser = async (req, res, next) => {
  const { error } = User.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ success: false, error: error.details[0].message });
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.password;

  res.status(404).json({
    message: "AAAA",
  });
};
