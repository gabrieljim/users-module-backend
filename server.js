const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});
mongoose.set('useFindAndModify', false);

const app = express();
app.use(express.static(path.join(__dirname, "client/build")))

app.use(express.json());

const users = require("./routes/users");

app.use("/users", users);

app.get("*", (_, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
})

app.listen(process.env.PORT, () =>
  console.log("Server listening on port " + process.env.PORT)
);
