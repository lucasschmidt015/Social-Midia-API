//Sequelize models
const Friendship = require("../models/friendship");
const User = require("../models/user");

//General
const utils = require("../utils/utils");

/** This method will create a new friendship request
 *
 * @param {object} req
 * @param {object} res
 * @param {fuction} next
 * @returns
 */
exports.new_friendship_request = async (req, res, next) => {
  //Extract senderUserId and receiverUserId from the request body
  const { senderUserId, receiverUserId } = req.body;

  //IF senderUserId or receiverUserId are not defined, send an error response
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
    //Check if the sender exists
    const senderExists = await User.findByPk(senderUserId);

    //If the sender does not exists, send an error response
    if (!senderExists) {
      throw utils.createNewError(
        "The provided senderUserId does not exists.",
        400
      );
    }
    //Check if the receiver exists
    const receiverExists = await User.findByPk(receiverUserId);

    //If the receiver does not exists, send an error response
    if (!receiverExists) {
      throw utils.createNewError(
        "The provided receiverUserId does not exists.",
        400
      );
    }

    //Check if the two provided users are already friends
    const alreadyFriends = await Friendship.findOne({
      where: { senderUserId: senderUserId, receiverUserId: receiverUserId },
    });

    //If they are, send a error response
    if (alreadyFriends) {
      throw utils.createNewError(
        alreadyFriends.accepted
          ? "The two provided users are already friends"
          : "Friendship request already sent.",
        409
      );
    }

    //Store the new Friendship request in the database
    const newFriendship = await Friendship.create({
      accepted: false,
      senderUserId: senderUserId,
      receiverUserId: receiverUserId,
    });

    //Send a success response
    return utils.sendResponse(res, 201, {
      success: true,
      friendship: newFriendship,
    });
  } catch (err) {
    next(err);
  }
};
