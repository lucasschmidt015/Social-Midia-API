//External packages
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");
const path = require("path");
const cors = require("cors");

//routes
const userRouter = require("./routes/user");

//models
const userModel = require("./models/user");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "resources")));

app.use(userRouter);

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
