const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.get("/", UserController.allowIfLoggedIn, UserController.getUsers);
router.post("/login", UserController.logIn);
router.post("/register", UserController.register);
router.post("/update", UserController.allowIfLoggedIn, UserController.update);
router.post("/createUser", UserController.createUser);
router.post("/requestNewPassword", UserController.requestNewPassword);
router.post("/updatePassword", UserController.updatePassword);

module.exports = router;
