const Sequelize = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define(
  "ResetPasswordToken",
  {
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    token: {
      type: Sequelize.STRING(300)
    }
  },
  {
    freezeTableName: true,
    tableName: "reset_password_tokens"
  }
);
