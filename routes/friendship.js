const express = require("express");

const friendshipController = require("../controllers/friendship");

const router = express.Router();

router.post(
  "/new_friendship_request",
  friendshipController.new_friendship_request
);

module.exports = router;
