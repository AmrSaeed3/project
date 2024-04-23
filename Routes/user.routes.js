const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../Controllers/user.controllers");
const {
  validationSchema,
  validationSchema2,
  validationSchema3,
  validationSchema4,
} = require("../Middlewires/validationSchema");
const verifyToken = require("../Middlewires/verify.token");

router.route("/register").post(validationSchema(),usersController.register);


router.route("/login").post(validationSchema2(), usersController.login);

router.route("/login2").post(validationSchema2(), usersController.login2);


router.route("/auth/google").get(usersController.authGoogle);

// router.route("/auth/google/callback").get(usersController.authGoogleCallback);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/failure" }),
  (req, res) => {
    res.redirect("/success");
  }
);

router.route("/auth/facebook").get(passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failure" }),
  (req, res) => {
    res.redirect("/success");
  }
);

// مسار لإعادة تعيين كلمة المرور (نسيان الباسورد)
router
  .route("/forgot-password")
  .post(validationSchema4(), usersController.forgotPassword);
// // مسار لمعالجة إعادة تعيين كلمة المرور بعد الإرسال
router
  .route("/reset-password")
  .post(verifyToken, usersController.resetPasswordSend);
// مسار لإعادة تعيين كلمة المرور
router
  .route("/reset-password-ok")
  .post(verifyToken, validationSchema3(), usersController.resetPasswordOk);
//
router
  .route("/deleteUser")
  .post(validationSchema4(), usersController.deleteUser);

router.route("/success").get(usersController.success);

router.route("/failure").get(usersController.failure);

router.route("/logout").get(usersController.logout);


router.route("/logout2").get(usersController.logout2);

// مسار رئيسي
router.get("/2", (req, res) => {
  res.send("Home Page");
});
//

// تحقق من ما إذا كان المستخدم قد قام بتسجيل الدخول
// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/");
// }

module.exports = router;
