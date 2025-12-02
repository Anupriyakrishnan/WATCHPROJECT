const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const userRouter = require("./router/userRouter.js");
const db = require("./config/db");
dotenv.config();
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS view engine
app.set("view engine", "ejs");

// Correct __dirname
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
]);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", userRouter);

// app.use("/admin", adminRouter);

app.listen(process.env.PORT || 4001, () => {
  console.log("Server running on port " + process.env.PORT);
});

module.exports = app;
