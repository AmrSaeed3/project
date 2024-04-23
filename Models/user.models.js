const mongoose = require("mongoose");
const validator = require("validator");
const userRole = require("../utils/userRoles");
// محتاجه صيانه
const User = new mongoose.Schema({
  userName: {
    type: String,
    require: [true, "user name are required"],
  },
  email: {
    type: String,
    require: [true, "email are required"],
    unique: true,
    validate: [validator.isEmail, "filed must be a valid email address"],
  },
  password: {
    type: String,
    require: [true, "email are required"],
  },
  token: {
    type: String,
    require: [true, "token are required"],
  },
  date: {
    type: String,
    require: [true, "date are required"],
  },
  role: {
    type: String, //["USER" , "ADMIN" , "MANGER"]
    enum: [userRole.USER, userRole.ADMIN, userRole.MANGER],
    default: userRole.USER,
  },
});
const UserGoogle = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
});
const UserToken = new mongoose.Schema({
  token: String,
});
const UserFaceBook = new mongoose.Schema({
  facebookId: String,
  displayName: String,
  // email: String,
  // token:String,
});

const user1 = mongoose.model("Acount", User);
const user2 = mongoose.model("UserGoogle", UserGoogle);
const user3 = mongoose.model("UserToken", UserToken);
const user6 = mongoose.model("UserFaceBook", UserFaceBook);
module.exports = {
  user1,
  user2,
  user3,
  user6,
};
