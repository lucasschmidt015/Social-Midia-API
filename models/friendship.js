const sequelize = require("../utils/database");
const Sequelize = require("sequelize");

const User = require("./user");

const Joi = require("joi");

const Friendship = sequelize.define("Friendship", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  userId1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  userId2: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

Friendship.belongsTo(User, {
  foreignKey: "userId1",
  as: "user1",
});

Friendship.belongsTo(User, {
  foreignKey: "userId2",
  as: "user2",
});

module.exports = Friendship;
