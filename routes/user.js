const express = require("express");

//Import the user controller
const userController = require("../controllers/user");

//Create an express router
const router = express.Router();

//Define routes and associate them with the corresponding controller methods
router.get("/user/:userId", userController.getUser); //Route to retrive user information

router.post("/create-user", userController.createUser); // Route to create a new user

router.post("/login", userController.login); // Route to handle user login

router.post("/request_recover_password", userController.requestRecoverPassword); //Route to iniciate password recovery

router.post("/recover_password", userController.handleRecoverPassword); //Route to handle password recovery

//Export the router for user in the other parts of the application
module.exports = router;
