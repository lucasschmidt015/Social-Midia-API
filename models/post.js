const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const User = require("./user");

const Post = sequelize.define("Post", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING(255),
  },
  content: {
    type: Sequelize.TEXT,
  },
  hasgtag: {
    type: Sequelize.STRING(255),
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "userId",
});

module.exports = Post;
