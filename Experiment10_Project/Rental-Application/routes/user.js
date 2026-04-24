const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl, validateUser } = require("../middleware");
const userController = require("../controllers/users");

//signup form and Signup User Route
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(validateUser, saveRedirectUrl, wrapAsync(userController.signupUser));

//login form and Login User Route
router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    (req, resp, next) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return resp.status(401).json({ error: info.message || "Invalid username or password" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return userController.loginSuccess(req, resp);
        });
      })(req, resp, next);
    }
  );

//logout user
router.get("/logout", userController.logoutUser)

module.exports = router;