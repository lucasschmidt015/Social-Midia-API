const Friendship = require("../models/friendship");
const User = require("../models/user");

const utils = require("../utils/utils");

exports.new_friendship_request = async (req, res, next) => {
  const { senderUserId, receiverUserId } = req.body;

  if (!senderUserId || !receiverUserId) {
    let message;

    if (!senderUserId && !receiverUserId) {
      message = "You need to send senderUserId and receiverUserId";
    } else if (!senderUserId) {
      message = "You need to send senderUserId";
    } else {
      message = "You need to send receiverUserId";
    }

    return next(
      utils.createNewError("Some input data is missing.", 400, {
        message: message,
      })
    );
  }

  try {
    const senderExists = await User.findByPk(senderUserId);

    if (!senderExists) {
      throw utils.createNewError(
        "The provided senderUserId does not exists.",
        400
      );
    }

    const receiverExists = await User.findByPk(receiverUserId);

    if (!receiverExists) {
      throw utils.createNewError(
        "The provided receiverUserId does not exists.",
        400
      );
    }

    const alreadyFriends = await Friendship.findOne({
      where: { senderUserId: senderUserId, receiverUserId: receiverUserId },
    });

    if (alreadyFriends) {
      throw utils.createNewError(
        "The two provided users are already friends",
        409
      );
    }

    //Create here the new friendship request <------------
  } catch (err) {
    next(err);
  }
};
