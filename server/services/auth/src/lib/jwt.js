const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      mobile: user.mobile,
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

module.exports = { createAccessToken };
