const express = require("express");

//controllers
const userController = require("../controllers/user");

const router = express.Router();

router.get("/user/:userId", userController.getUser);

router.post("/create-user", userController.createUser);

module.exports = router;
