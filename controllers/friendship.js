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
exports.newFriendshipRequest = async (req, res, next) => {
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

/** This method is going to accept a friendship request
 *
 * @param {object} req
 * @param {object} res
 * @param {fuction} next
 * @returns
 */
exports.acceptFriendshipRequest = async (req, res, next) => {
  //Extract friendshipRequestId from the request body
  const { friendshipRequestId } = req.body;

  //If the paramn wasn't passed, send an error response
  if (!friendshipRequestId) {
    return next(
      utils.createNewError("Some input data is missing.", 400, {
        message: "You need to send friendshipRequestId",
      })
    );
  }

  try {
    //Find the friendshipRequest in the database
    const friendshipRequest = await Friendship.findByPk(friendshipRequestId);

    //If the friendship request wasn't found, send an error response
    if (!friendshipRequest) {
      throw utils.createNewError(
        "No friendship request found with the provided id",
        404,
        { friendshipRequestId }
      );
    }

    //IF the user stored in the friendship request does not metch the user stored
    //in the request object (Who is accepting isn't the same person that's receiving the friendship
    //request), send an error reponse
    if (friendshipRequest.receiverUserId !== req.user.userId) {
      throw utils.createNewError("Access denied.", 401);
    }

    //If the friendship request is already accepted, send an error response
    if (friendshipRequest.accepted) {
      throw utils.createNewError("Friendship request already accepted.", 400);
    }

    //Set accepted to true, you guys are friends now :)
    friendshipRequest.accepted = true;

    //Save the changes in the database
    await friendshipRequest.save();

    //send the success response.
    return utils.sendResponse(res, 200, {
      success: true,
      message: "Friendship request was accepted.",
    });
  } catch (err) {
    next(err);
  }
};

//We still have to handle the case where a user send a friendship request to another
//user that already has sent a friendship request to the first one <--------
