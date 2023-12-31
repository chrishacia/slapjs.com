const login = require('./api/login');
const register = require('./api/register');
const forgotpw = require('./api/forgot-pw-pt1');
const forgotverify = require('./api/forgot-pw-pt2');

module.exports = {
  login,
  register,
  forgotpw,
  forgotverify,
};
