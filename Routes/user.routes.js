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

router.route("/register").post(validationSchema(), usersController.register);

router.route("/login2").post(validationSchema2(), usersController.login2);


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

router.route("/historyUser2").get(verifyToken, usersController.historyUser2);

router
  .route("/deleteUser")
  .post(validationSchema4(), usersController.deleteUser);

router
  .route("/deleteData/:num")
  .delete(verifyToken,usersController.deleteData);


router.route("/addData2").post(verifyToken, usersController.addData2);

module.exports = router;
