const express = require("express");

//Import the friendshipController
const friendshipController = require("../controllers/friendship");

//Import the middleware responsible for check Authorization
const isAuth = require("../middlewares/isAuth");

const router = express.Router();

//List all friends of the logged user
router.get("/list_all_friends", isAuth, friendshipController.listAllFriends);

//Create a new friendship request
router.post(
  "/new_friendship_request",
  isAuth,
  friendshipController.newFriendshipRequest
);

//Accept a friendship request
router.post(
  "/accept_friendship_request",
  isAuth,
  friendshipController.acceptFriendshipRequest
);

router.delete(
  "/delete_friendship",
  isAuth,
  friendshipController.deleteFriendship
);

module.exports = router;
