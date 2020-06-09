const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.tecnofep.com.ve",
  port: 465,
  secure: true,
  auth: {
    user: "no_contestar@tecnofep.com.ve",
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
