const validator = require('email-validator');
const xssFilters = require('xss-filters');
const Login = require('../../data/models/login.model');
const Users = require('../../data/models/users.model');
const { verifyPassword } = require('../../utils/password.functions');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');
const { logger, invalidUseLogger } = require('../../logger');
const dotenv = require('dotenv');
const login = new Login();
const restful = require('../../helpers/restful');
const { generateJwtToken } = require('../../utils/jwt.functions');

dotenv.config();
/**
 * TODO: Add Failed Login Attempts check, lock account after 5 failed attempts
 * TODO: Add Unknow User check, block IP after 5 failed attempts
 */

module.exports = function loginHandler(req, res) {
  restful(req, res, {
    async post() {
      if(!validateInputs(req, res)) { return; }

      try {
        const { email, password } = req.body;
        const safeEmail = xssFilters.inHTMLData(email);
        const safePassword = xssFilters.inHTMLData(password);

        const user = new Users();
        if(!await user.getUserExistsByEmail(safeEmail)) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
          return;
        }

        const userId = await user.getUserIdByEmail(safeEmail);
        const creds = await login.getPassDetailsForComparison(safeEmail);

        if (creds.length === 0) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
          return;
        }

        if(!await verifyPassword(safePassword, creds[0].salt, creds[0].pass)) {
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
          return;
        }

        const session = {
          id: userId,
          email: email,
          create_ts: getUtcDateTime(),
        };

        const token = generateJwtToken(session, '1h');
        const refreshToken = generateJwtToken(session, '30d');

        req.session.userId = session;
        req.session.email = email;
        res.status(200).json({ data: {...session, token, refreshToken}, error: '' });

      } catch (err) {
        logger.error(err);
        res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
      }
    },
    get() {
      invalidUseLogger('loginHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    put() {
      invalidUseLogger('loginHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    delete() {
      invalidUseLogger('loginHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
  });
};

const validateInputs = (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
    return false;
  }

  if (!validator.validate(email)) {
    res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
    return false;
  }

  if (!password) {
    res.status(400).json({ data: [], error: 'PASSWORD_EMPTY' });
    return false;
  }

  return true;
}

//
