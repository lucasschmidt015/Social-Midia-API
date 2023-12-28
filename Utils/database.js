const Sequelize = require("sequelize");
const {
  parsed: {
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_PORT,
    DATABASE_HOST,
  },
} = require("dotenv").config();

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

module.exports = sequelize;
