const express = require("express");
const router = express.Router();
const usersController = require("../Controllers/user.controllers");
const {
  validationSchema,
  validationSchema2,
  validationSchema3,
  validationSchema4,
} = require("../Middlewires/validationSchema");
const verifyToken = require("../Middlewires/verify.token");

router.route("/register").post(validationSchema(),usersController.register);



router.route("/login2").post(validationSchema2(), usersController.login2);

// router.route("/historyUser").post(verifyToken ,usersController.historyUser);
router.route("/historyUser").get(usersController.historyUser);
// مسار لإعادة تعيين كلمة المرور (نسيان الباسورد)
// router
//   .route("/forgot-password")
//   .post(validationSchema4(), usersController.forgotPassword);
// // // مسار لمعالجة إعادة تعيين كلمة المرور بعد الإرسال
// router
//   .route("/reset-password")
//   .post(verifyToken, usersController.resetPasswordSend);
// // مسار لإعادة تعيين كلمة المرور
// router
//   .route("/reset-password-ok")
//   .post(verifyToken, validationSchema3(), usersController.resetPasswordOk);
// //

router
  .route("/deleteUser")
  .post(validationSchema4(), usersController.deleteUser);

router
  .route("/addData")
  .post(usersController.addData);


module.exports = router;
