const Sequelize = require("sequelize");

//Extract database configuration parameters from environment variables
const {
  parsed: {
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_PORT,
    DATABASE_HOST,
  },
} = require("dotenv").config();

//Create a new Sequelize instace with database connection datails
const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    dialect: "mysql",
  }
);

//Export the configured Sequelize instace for use in other parts of the application
module.exports = sequelize;
