const jwt = require("jsonwebtoken");

require("dotenv").config();
secretKey = process.env.JWT_SECLET_KEY;
const generate = async (payload) => {
  const expireIn = "24h";
  const token = await jwt.sign(payload, secretKey , { expiresIn: expireIn });
  return  token;
};
module.exports = {
  generate,
};
