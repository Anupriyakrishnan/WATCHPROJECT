const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session")
const passport = require("./config/passport.js")
const userRouter = require("./router/userRouter.js");
const adminRouter =require("./router/adminRouter.js")
const db = require("./config/db");
dotenv.config();
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    secure:false,
    httpOnly:true,
    maxAge:72*60*60*100000
  }
}))

app.use(passport.initialize())
app.use(passport.session())
app.use((req,res,next)=>{
  res.set("cache-control","no-store")
  next()
})

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

app.use("/admin", adminRouter);

app.listen(process.env.PORT || 4001, () => {
  console.log("Server running on port " + process.env.PORT);
});

module.exports = app;
