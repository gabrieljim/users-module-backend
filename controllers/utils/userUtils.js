const encrypt = async target => {
	const bcrypt = require("bcrypt");
	const saltRounds = 6;
	const encryptedTarget = await bcrypt.hash(target, saltRounds);
	return encryptedTarget;
};

const compareEncryptedString = (plainTextString, encryptedString) => {
	const bcrypt = require("bcrypt");
	return bcrypt.compare(plainTextString, encryptedString);
};

const generateJWTToken = async (data, options = {}) => {
	const jwt = require("jsonwebtoken");
	const token = jwt.sign(data, process.env.SECRET, options);
	return token;
};

const validateToken = token => {
	const jwt = require("jsonwebtoken");
	return jwt.verify(token, process.env.SECRET);
};

const mail = async (id, email, token) => {
	const transporter = require("../../config/transporter");
	const mailOptions = {
		from: "Gabriel <gabrieljim@airmail.cc>",
		to: email,
		subject: "Reinicio de contraseña",
		html: `<a href="${process.env.CLIENT_URL}/${id}/${encodeURIComponent(
			token
		)}">Resetear contraseña</a>`
	};
	const mailSent = transporter.sendMail(mailOptions);
	return mailSent;
};

const generateResetPasswordToken = async () => {
	Date.prototype.addHours = function(h) {
		this.setTime(this.getTime() + (h*60*60*1000));
		return this;
	}

	const crypto = require("crypto");
	const cryptoToken = crypto.randomBytes(32).toString("hex");
	const resetPasswordTokenInfo = {
		data: cryptoToken,
		exp: new Date().addHours(1)
	};

	return resetPasswordTokenInfo;
};

module.exports = {
	encrypt,
	compareEncryptedString,
	generateJWTToken,
	validateToken,
	mail,
	generateResetPasswordToken
};
