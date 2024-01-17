const express = require("express");

//controllers
const userController = require("../controllers/user");

const router = express.Router();

router.get("/user/:userId", userController.getUser);

router.post("/create-user", userController.createUser);

router.post("/login", userController.login);

router.post("/request_recover_password", userController.requestRecoverPassword);

module.exports = router;
