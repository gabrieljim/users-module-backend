const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
	host: "mail.cock.li",
	port: 587,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
})

module.exports = transporter;
