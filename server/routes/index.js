const login = require('./api/login');
const logout = require('./api/logout');
const register = require('./api/register');
const forgotpw = require('./api/forgot-pw-pt1');
const forgotverify = require('./api/forgot-pw-pt2');

module.exports = {
  login,
  logout,
  register,
  forgotpw,
  forgotverify,
};
