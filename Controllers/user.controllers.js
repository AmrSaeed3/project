const { user1 } = require("../Models/user.models");
const appError = require("../utils/appError");
const httpStatus = require("../utils/httpStatus");
const asyncWrapper = require("../Middlewires/asyncWrapper");
const generateJwt = require("../utils/generate.jwt");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const UserAll = user1;

//register
const register = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array()[0], 400, httpStatus.FAIL);
    return next(error);
  }
  const { signup_email, signup_password, confirm_password } = req.body;
  const olduser = await UserAll.findOne({ email: signup_email });
  if (olduser) {
    const error = appError.create("user already exists", 400, httpStatus.FAIL);
    return next(error);
  }
  if (signup_password != confirm_password) {
    const error = appError.create("Password is not same", 400, httpStatus.FAIL);
    return next(error);
  }
  const hashPassword = await bcrypt.hash(signup_password, 10);
  const currentDate = moment().tz("Africa/Cairo");
  const newUser = new UserAll({
    email: signup_email,
    password: hashPassword,
    date: currentDate.format("DD-MMM-YYYY hh:mm:ss a"),
  });
  await newUser.save();
  return res.status(200).json({
    status: httpStatus.SUCCESS,
  });
  // const redirectUrl = `/verify?userName=${userName}&email=${email}&password=${password}&token=${token}`;
  // res.redirect(redirectUrl)
});

//login

const login2 = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatus.FAIL);
    return next(error);
  }

  const user = await UserAll.findOne({ email: email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatus.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
    const token = await generateJwt.generate({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    user.token = token;
    await user.save();
    res.json({
      status: httpStatus.SUCCESS,
      data: { token: token },
    });
  } else if (user.password !== password) {
    const error = appError.create(
      "password is incorrect",
      400,
      httpStatus.FAIL
    );
    return next(error);
  } else {
    const error = appError.create("somthing wrong", 500, httpStatus.ERROR);
    return next(error);
  }
});
// مسار لإعادة تعيين كلمة المرور (نسيان الباسورد)

// const forgotPassword = asyncWrapper(async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = appError.create(errors.array()[0], 400, httpStatus.FAIL);
//     return next(error);
//   }
//   const email = req.body.email;
//   const user = await UserAll.findOne({ email: email });
//   if (!user) {
//     const error = appError.create(
//       "not found this email !",
//       400,
//       httpStatus.FAIL
//     );
//     return next(error);
//   }
//   const verifyCode = await emailVerfy.sendEmail(email);
//   const hashVerifyCode = await bcrypt.hash(JSON.stringify(verifyCode), 10);
//   const token = await generateJwt.generate({
//     email: email,
//     id: user._id,
//     role: user.role,
//     verifyCode: hashVerifyCode,
//     // id: uuid.v4(),
//   });
//   return res.status(200).json({
//     status: httpStatus.SUCCESS,
//     // data: newUser,
//     token: token.token,
//     expireData: token.expireIn,
//   });
//   // res.redirect(`/reset-password`)
// });

// const resetPasswordSend = asyncWrapper(async (req, res, next) => {
//   const { email, verifyCode, role, id } = req.currentUser;
//   const currentCode = verifyCode;
//   const code = req.body.code;
//   const matchedCode = await bcrypt.compare(code, currentCode);
//   if (!matchedCode) {
//     const error = appError.create(
//       "the code verification not correct try again",
//       400,
//       httpStatus.FAIL
//     );
//     return next(error);
//   }
//   const token = await generateJwt.generate({
//     email: email,
//     role: role,
//     id: id,
//     // id: uuid.v4(),
//   });
//   return res.status(200).json({
//     status: httpStatus.SUCCESS,
//     token: token.token,
//     expireData: token.expireIn,
//   });
// });
// //
// const resetPasswordOk = asyncWrapper(async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = appError.create(errors.array()[0], 400, httpStatus.FAIL);
//     return next(error);
//   }
//   const { email, role, id } = req.currentUser;
//   const newPassword = req.body.newPassword;
//   const newPassword2 = req.body.newPassword2;
//   if (newPassword !== newPassword2) {
//     const error = appError.create(
//       "the password is not the same",
//       400,
//       httpStatus.FAIL
//     );
//     return next(error);
//   }
//   const hashPassword = await bcrypt.hash(newPassword, 10);
//   const newUser = await UserAll.findOne({ email: email });
//   newUser.password = hashPassword;
//   await newUser.save();
//   const error = appError.create(
//     "the password has been reset successfully",
//     200,
//     httpStatus.SUCCESS
//   );
//   return next(error);
// });

// const logout = async (req, res) => {
//   if (req.isAuthenticated()) {
//     const { email } = req.user;

//     // توفير وظيفة callback
//     req.logout(() => {
//       // حذف البريد الإلكتروني من قاعدة البيانات
//       UserGoogle
//         .findOneAndDelete({ email })
//         .then(() => {
//           // حذف الكوكيز معرف المستخدم
//           res.clearCookie("userId");
//           res.clearCookie("sessionToken");
//           res.redirect("/");
//         })
//         .catch((err) => {
//           console.error("Error deleting user:", err);
//           res.redirect("/");
//         });
//     });

//     return;
//   }

//   // إذا لم يكن المستخدم قد قام بتسجيل الدخول، قم بتوجيهه إلى الصفحة الرئيسية أو أي مكان آخر
//   res.redirect("/");
// };

const deleteUser = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array()[0], 400, httpStatus.FAIL);
    return next(error);
  }
  const email = req.body.email;
  const user = await UserAll.findOne({ email: email });
  if (!user) {
    const error = appError.create(
      "not found this email !",
      400,
      httpStatus.FAIL
    );
    return next(error);
  }
  await UserAll.deleteOne({ email: email });
  const error = appError.create(
    "this email has been deleted",
    200,
    httpStatus.SUCCESS
  );
  return next(error);
});

const historyUser2 = asyncWrapper(async (req, res, next) => {
  const { email, role, id } = req.currentUser;
  const user = await UserAll.findOne({ email: email });
  return res.status(200).json({
    status: httpStatus.SUCCESS,
    allData: user.Info,
  });
});


const addData2 = asyncWrapper(async (req, res, next) => {
  const { youtube_link, result } = req.body;
  const { email, role, id } = req.currentUser;
  const user = await UserAll.findOne({ email: email });

  if (!user) {
    const error = appError.create("user not found !", 400, httpStatus.FAIL);
    return next(error);
  }

  const currentDate = moment().tz("Africa/Cairo");
  const existingIndex = user.Info.findIndex(
    (info) => info.youtube_link === youtube_link
  );

  if (existingIndex !== -1) {
    // إذا كان الرابط موجودًا، قم بتحديث التاريخ والبيانات المحددة وحرك العنصر إلى البداية
    user.Info[existingIndex].currentDate = currentDate.format(
      "DD-MMM-YYYY hh:mm:ss a"
    );

    // تحديث القيم المحددة فقط
    if (result.hasOwnProperty("summary")) {
      user.Info[existingIndex].summaries = result.summary;
      user.Info[existingIndex].time_range = result.time_range;
    }
    if (
      result.hasOwnProperty("positive_percentage") &&
      result.hasOwnProperty("negative_percentage") &&
      result.hasOwnProperty("neutral_percentage")
    ) {
      user.Info[existingIndex].positive_percentage = result.positive_percentage;
      user.Info[existingIndex].negative_percentage = result.negative_percentage;
      user.Info[existingIndex].neutral_percentage = result.neutral_percentage;
    }

    // تحريك العنصر إلى البداية
    const updatedInfo = user.Info.splice(existingIndex, 1)[0];
    user.Info.unshift(updatedInfo);
  } else {
    // إذا كان الرابط غير موجود، أضف البيانات الجديدة
    const newInfo = {
      youtube_link,
      currentDate: currentDate.format("DD-MMM-YYYY hh:mm:ss a"),
    };

    if (result.hasOwnProperty("summary")) {
      newInfo.summaries = result.summary;
      newInfo.time_range = result.time_range;
      newInfo.negative_percentage = 0;
      newInfo.neutral_percentage = 0;
      newInfo.positive_percentage = 0;
    } else {
      newInfo.summaries = "empty";
      newInfo.time_range = "empty";
      newInfo.negative_percentage = result.negative_percentage || 0;
      newInfo.neutral_percentage = result.neutral_percentage || 0;
      newInfo.positive_percentage = result.positive_percentage || 0;
    }

    user.Info.unshift(newInfo);
  }

  await user.save();

  res.json({
    status: httpStatus.SUCCESS,
  });
});

const deleteData = asyncWrapper(async (req, res, next) => {
  const { num } = req.params;
  // // const numbers = req.params.num;

  const { email, role, id } = req.currentUser;
  const user = await UserAll.findOne({ email: email });
  if (!user) {
    const error = appError.create(
      "not found this email !",
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  // حذف الرابط من المصفوفة
  user.Info.splice(num, 1);

  // حفظ التغييرات في قاعدة البيانات
  await user.save();
  const error = appError.create(
    "this data has been deleted",
    200,
    httpStatus.SUCCESS ,
    user.Info
  );
  return next(error);
});
//
module.exports = {
  addData2,
  deleteData,
  deleteUser,
  historyUser2,
  // forgotPassword,
  // resetPasswordSend,
  // resetPasswordOk,
  register,
  login2,
};
