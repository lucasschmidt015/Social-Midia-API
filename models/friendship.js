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
  senderUserId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  receiverUserId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

Friendship.belongsTo(User, {
  foreignKey: "senderUserId",
  as: "senderUser",
});

Friendship.belongsTo(User, {
  foreignKey: "receiverUserId",
  as: "receiverUser",
});

module.exports = Friendship;
