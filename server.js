const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const app = express();

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(express.json());

const users = require("./routes/users");

app.use("/users", users);

app.listen(process.env.PORT, () =>
  console.log("Server listening on port " + process.env.PORT)
);
