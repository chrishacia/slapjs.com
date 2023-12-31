const dotenv = require('dotenv');

dotenv.config();

module.exports = () => {
  let domain = process.env.DEV_DOMAIN;
  if (process.env.NODE_ENV === 'e2e' || process.env.NODE_ENV === 'stage') {
    domain = process.env.E2E_DOMAIN;
  }
  if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production') {
    domain = process.env.E2E_DOMAIN;
  }
  return domain;
};
