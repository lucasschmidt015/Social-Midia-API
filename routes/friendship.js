const express = require("express");

//Import the friendshipController
const friendshipController = require("../controllers/friendship");

//Import the middleware responsible for check Authorization
const isAuth = require("../middlewares/isAuth");

const router = express.Router();

//Create a new friendship request
router.post(
  "/new_friendship_request",
  isAuth,
  friendshipController.new_friendship_request
);

module.exports = router;