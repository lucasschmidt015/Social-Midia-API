const Sequelize = require("sequelize");
const sequelize = require("../utils/database");
const Joi = require("joi");
const nodemailer = require("nodemailer");

const {
  parsed: { USER_EMAIL_SERVER, PASS_EMAIL_SERVER },
} = require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: USER_EMAIL_SERVER,
    pass: PASS_EMAIL_SERVER,
  },
});

const User = sequelize.define("User", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING(150),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  passwordResetToken: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
  passwordResetTokenExpiration: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
  },
});

User.validate = (body) => {
  const userSchema = Joi.object({
    name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  return userSchema.validate(body);
};

User.sendResetPasswordEmail = (user, linkResetPage) => {
  transporter.sendMail({
    to: user.email,
    from: `SocialMidia ${USER_EMAIL_SERVER}`,
    subject: "Reset your password",
    html: `
        <!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="UTF-8">
            <title>Password Reset</title>
        </head>
        
        <body>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border: 1px solid #e4e4e4;">
                            <tr>
                                <td align="center" style="padding: 20px;">
                                    <h1>Password Reset</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px;">
                                    <p>Hello,</p>
                                    <p>You are receiving this email because you requested a password reset for your account.</p>
                                    <p>To reset your password, click the link below:</p>
                                    <p><a href="http://localhost:3000/passwordReset/${linkResetPage}">Reset Password</a></p>
                                    <p>If you did not request this password reset, please ignore this email.</p>
                                    <p>Thank you!</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="background-color: #f4f4f4; padding: 20px;">
                                    <p>&copy; 2023 Lucas Schmidt</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>
    `,
  });
};

module.exports = User;
