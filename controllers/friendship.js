//Sequelize models
const { Sequelize } = require("sequelize");
const Friendship = require("../models/friendship");
const User = require("../models/user");

//General
const utils = require("../utils/utils");

/** This method will list all friends of the user
 *
 * @param {object} req
 * @param {object} res
 * @param {fuction} next
 * @returns
 */
exports.listAllFriends = async (req, res, next) => {
  //Pick the id of the logged user
  const userId = req.user.userId;

  //If the id is not defined, send an error message
  if (!userId) {
    return next(utils.createNewError("Access denied.", 401));
  }

  try {
    //Find the frindships related to that user
    const friendships = await Friendship.findAll({
      where: {
        [Sequelize.Op.or]: [
          { senderUserId: userId },
          { receiverUserId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "senderUser",
          where: { id: { [Sequelize.Op.ne]: userId } },
          required: false,
        },
        {
          model: User,
          as: "receiverUser",
          where: { id: { [Sequelize.Op.ne]: userId } },
          required: false,
        },
      ],
    });

    //If there's no one, send an error response
    if (!friendships || friendships.length <= 0) {
      throw utils.createNewError("No friends were found.", 404);
    }

    //Format the friends array
    const friends = friendships
      .filter((friendship) => friendship.accepted)
      .map((friendship) => {
        return {
          Id: friendship.id,
          accepted: friendship.accepted,
          userData: friendship.senderUser || friendship.receiverUser,
        };
      });

    if (friends.length <= 0) {
      throw utils.createNewError("No friends were found.", 404);
    }

    //Send a success response
    return utils.sendResponse(res, 200, friends);
  } catch (err) {
    next(err);
  }
};

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

    const existingFriendshipRequest = await Friendship.findOne({
      where: { senderUserId: receiverUserId, receiverUserId: senderUserId },
    });

    //If we already have a friendship request sent by the receiver, it'll be automatically accepted
    if (existingFriendshipRequest) {
      if (existingFriendshipRequest.accepted) {
        return utils.sendResponse(res, 200, {
          success: true,
          message: "Users are already friends",
        });
      } else {
        existingFriendshipRequest.accepted = true;
        await existingFriendshipRequest.save();
        return utils.sendResponse(res, 200, {
          success: true,
          message: "Now the users are friends",
        });
      }
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

/** This route handles a friendship deletion
 *
 * @param {object} req
 * @param {object} res
 * @param {fuction} next
 * @returns
 */
exports.deleteFriendship = async (req, res, next) => {
  //Extract the friendshipId from the request body
  const { friendshipId } = req.body;

  //If friendshipId was not passed, send an error reponse
  if (!friendshipId) {
    next(
      utils.createNewError("Some input data is missing", 400, {
        message: "You need to send friendshipId",
      })
    );
  }

  try {
    //Find the frindship in the database
    const friendship = await Friendship.findByPk(friendshipId);

    //No frindship was found with the provided id, send an error
    if (!friendship) {
      throw utils.createNewError(
        "No friendship found with the provided id",
        404,
        { friendshipId }
      );
    }

    //Check if the request was made by one of the users in the friendship
    if (
      friendship.senderUserId !== req.user.userId &&
      friendship.receiverUserId !== req.user.userId
    ) {
      throw utils.createNewError("Access denied", 401);
    }

    //Delete the friendship
    await friendship.destroy();

    //Send a success response
    return utils.sendResponse(res, 200, {
      success: true,
      message: "Friendship deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
