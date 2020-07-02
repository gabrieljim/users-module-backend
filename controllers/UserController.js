const User = require("../models/User");
const utils = require("./utils/userUtils");

exports.allowIfLoggedIn = async (req, res, next) => {
	const Cookies = require("universal-cookie");
	const cookies = new Cookies(req.headers.cookie);

	const token = cookies.get("token");

	if (!token) {
		return res.status(401).json({ error: "Sesión no iniciada" });
	}

	try {
		const user = utils.validateToken(token);
		res.locals.user = user;
		next();
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			res.status(400).json({ error: "Sesión expirada" });
		} else if (e.name === "JsonWebTokenError") {
			res.status(400).json({ error: "Token inválido" });
		} else {
			res.status(500).json({ error: e.message });
		}
	}
};

exports.register = async (req, res) => {
	const { username, email, password } = req.body;
	const encPassword = await utils.encrypt(password);

	try {
		const newUser = await User.create({
			username,
			email,
			password: encPassword
		});

		const user = {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email
		};

		const token = await utils.generateJWTToken(user, { expiresIn: "1h" });

		res.status(200).json({ user, token });
	} catch (e) {
		if (e.code === 11000) {
			res.status(400).json({ error: "Usuario existente" });
		}
	}
};

exports.createUser = async (req, res) => {
	const { username, email, password } = req.body;
	const encPassword = await utils.encrypt(password);

	try {
		const newUser = await User.create({
			username,
			email,
			password: encPassword
		});

		const user = {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email
		};

		res.status(200).json({ user });
	} catch (e) {
		if (e.code === 11000) {
			res.status(400).json({ error: "Usuario existente" });
		}
	}
};

exports.logIn = async (req, res) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({
			$or: [{ username: username }, { email: username }]
		});

		if (!user) {
			return res.status(401).json({ error: "Usuario no encontrado" });
		}

		const result = await utils.compareEncryptedString(password, user.password);
		if (!result) {
			return res.status(401).json({ error: "Contraseña inválida" });
		}

		const payload = {
			id: user._id,
			username: user.username,
			email: user.email
		};

		const token = await utils.generateJWTToken(payload, { expiresIn: "1h" });
		res.status(200).json({ user: payload, token });
	} catch (e) {
		console.log(e);
		res.status(400).json({ e });
	}
};

exports.update = async (req, res) => {
	const { changes, id } = req.body;
	try {
		await User.findByIdAndUpdate(id, changes)
		res.status(200).json({ msg: "Updated succesfully" });
	} catch (e) {
		res.status(400).json({ e });
	}
};

exports.requestNewPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "Email no encontrado" });
		}

		const token = await utils.generateResetPasswordToken();

		user.passwordResetToken = token.data;
		user.passwordResetExpiration = token.exp;

		await user.save();

		await utils.mail(user._id, email, token.data);

		res.json({ message: "success" });
	} catch (e) {
		console.log(e);
		res.json({ e });
	}
};

exports.updatePassword = async (req, res) => {
	const { id, password } = req.body;
	const token = decodeURIComponent(req.body.token);

	const user = await User.findOne({
		_id: id,
		passwordResetToken: token,
		passwordResetExpiration: { $gt: Date.now() }
	});

	if (!user) {
		return res.status(400).json({ error: "Token inexistente o vencido" });
	}

	try {
		user.password = await utils.encrypt(password);
		user.passwordResetToken = undefined;
		user.passwordResetExpiration = undefined;
		await user.save();

		res.status(200).json({ message: "Password updated" });
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: e });
	}
};

exports.getUsers = async (_, res) => {
	const users = await User.find({});
	res.json({ users });
};
