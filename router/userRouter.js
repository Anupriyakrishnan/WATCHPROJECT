const express = require("express");
const router = express.Router();
const userController = require("../controller/user/userController");
const passport = require("passport");
const { userAuth } = require("../middlewares/auth");

router.get("/pageNotFound", userController.pageNotFound);
router.get("/", userController.loadHomepage);
router.get("/signup", userController.loadSignup);
router.get("/login", userController.loadLogin);
router.post("/signup", userController.signup);
router.get("/otpverification", userController.verifyOtp);
router.post("/otpverification", userController.otpVerification);
router.post("/resendOtp", userController.resendOtp);
router.post("/login", userController.login);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/signup",
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/");
  }
);
router.get("/logout", userController.logout);

module.exports = router;
