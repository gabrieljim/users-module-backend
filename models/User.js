const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	email: {
		type: String,
		unique: true
	},
	password: String,
	passwordResetToken: String,
	passwordResetExpiration: Date,
})

const User = mongoose.model("User", userSchema);
module.exports = User;
