const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./Utils/database");

const app = express();

app.use(bodyParser.json());

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
