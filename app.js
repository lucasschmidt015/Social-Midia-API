//External packages
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");
const path = require("path");
const cors = require("cors");

//routes
const userRouter = require("./routes/user");
const friendshipRouter = require("./routes/friendship");

//models
const userModel = require("./models/user");
const friendshipModel = require("./models/friendship");

//Create an Express application
const app = express();

//Enable cors for all routes
app.use(cors());

//Parse JSON bodies
app.use(bodyParser.json());

//Serve static files from the 'resources' directory
app.use(express.static(path.join(__dirname, "resources")));

//Use the user router for handling user-related routes
app.use(userRouter);

app.use(friendshipRouter);

//Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

//Sync the sequelize models with the database and start the server
sequelize
  .sync({ force: false }) //If 'force' is set to true, it will drop existing tables and recreate them
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
