const dotenv = require('dotenv');
// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

dotenv.config();

const secretKey = process.env.SERVER_SESSION_SECRET;

const getJwtTokenDetails = (req, res, next) => {
  const token = req.headers.authorization;
  const options = {
    algorithms: ['HS256']
  };

  jwt.verify(token, secretKey, options, (err, decoded) => {
    if (err) {
      res.status(401).json({ data: [], error: 'JWT_INVALID' });
      return;
    }

    req.user = decoded;
    next();
  });
};

const generateJwtToken = (payload, expiresIn) => {
  const options = {
    expiresIn: expiresIn || '1h',
    issuer: `${process.env.BASE_URL}`,
    algorithm: 'HS256'
  };

  return jwt.sign(payload, secretKey, options);
};

const verifyJwtToken = (token) => {
  const options = {
    algorithms: ['HS256']
  };

  return jwt.verify(token, secretKey, options);
};

module.exports = {
  generateJwtToken,
  getJwtTokenDetails,
  verifyJwtToken,
};