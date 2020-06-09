const User = require("../models/User");
//const ResetPasswordToken = require("../models/ResetPasswordToken");

const utils = require("./utils/userUtils");

exports.allowIfLoggedIn = async (req, res, next) => {
	const Cookies = require("universal-cookie");
	const cookies = new Cookies(req.headers.cookie);

	const token = cookies.get("token");

	if (!token) {
		return res.status(401).json({ error: "Sesión no iniciada" });
	}

	try {
		const user = await utils.validateToken(token);
		res.locals.user = user;
		next();
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			res.status(400).json({ error: "Sesión expirada" });
		} else {
			res.status(500).json({ error: e });
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
		console.log(e);
		res.json({error: "l"})
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
		const errors = [];
		e.errors.map(error => errors.push(error));
		res.status(400).json({ errors });
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
			id: user.dataValues.id,
			username: user.dataValues.username,
			email: user.dataValues.email,
		};

		const token = await utils.generateJWTToken(payload, { expiresIn: "1h" });
		res.status(200).json({ user: payload, token });
	} catch (e) {
		res.status(400).json({ e });
	}
};

exports.update = async (req, res) => {
	const { changes, id } = req.body;
	try {
		await User.update(changes, { where: { id } });
		res.status(200).json({ msg: "Updated succesfully" });
	} catch (e) {
		res.status(400).json({ e });
	}
};

exports.requestNewPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(400).json({ error: "Email no encontrado" });
		}

		const tokens = await utils.generateResetPasswordToken();

		const userToUpdate = await ResetPasswordToken.findOne({ where: { email } });
		if (userToUpdate) {
			userToUpdate.token = tokens.JWTTokenForDatabase;
			userToUpdate.save();
		} else {
			ResetPasswordToken.create({ email, token: tokens.JWTTokenForDatabase });
		}

		await utils.mail(user.id, email, tokens.encryptedToken);

		res.json({ message: "success" });
	} catch (error) {
		console.log(error);
		res.json({ error });
	}
};

exports.updatePassword = async (req, res) => {
	const { id, password } = req.body;
	const token = decodeURIComponent(req.body.token);

	const user = await User.findOne({ where: { id } });

	if (!user) {
		return res.status(400).json({ error: "Usuario no existente" });
	}

	const email = user.email;
	const tokenJWT = await ResetPasswordToken.findOne({ where: { email } });

	if (!tokenJWT) {
		return res.status(400).json({ error: "Token inválido" });
	}

	try {
		const resetPasswordJWT = await utils.validateToken(tokenJWT.token);
		const resetPasswordToken = resetPasswordJWT.data;

		const tokenIsValid = await utils.compareEncryptedString(
			resetPasswordToken,
			token
		);

		if (!tokenIsValid) {
			return res.status(400).json({ error: "Token inválido" });
		}

		tokenJWT.destroy();

		user.password = await utils.encrypt(password);
		await user.save();

		res.status(200).json({ message: "Password updated" });
	} catch (e) {
		if (e.name === "TokenExpiredError") {
			res.status(400).json({ error: "Token expirado" });
		} else {
			console.log(e);
			res.status(500).json({ error: e });
		}
	}
};

exports.getUsers = async (_, res) => {
	const users = await User.findAll();
	res.json({ users });
};
