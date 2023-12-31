const validator = require('email-validator');
const Login = require('../../data/models/login.model');
const Users = require('../../data/models/users.model');
const { verifyPassword } = require('../../utils/password.functions');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');
const logger = require('../../logger');

const login = new Login();
const restful = require('../../helpers/restful');

module.exports = function loginHandler(req, res) {
  restful(req, res, {
    post() {
      const { email, psswrd } = req.body;

      if (!email) {
        res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
        return;
      }

      if (!validator.validate(email)) {
        res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
        return;
      }

      if (!psswrd) {
        res.status(400).json({ data: [], error: 'PASSWORD_EMPTY' });
        return;
      }

      // user exists, get existing password to compare, create session
      const u = new Users();
      u.getUserExistsByEmail(email).then((exists) => {
        if (exists) {
          login.getPassDetailsForComparison(email).then((creds) => {
            if (creds.length > 0) {
              verifyPassword(psswrd, creds[0].salt, creds[0].pass).then((verified) => {
                if (verified) {
                  const session = {
                    user_id: 1,
                    create_ts: getUtcDateTime(),
                  };
                  res.status(200).json({ data: session, error: '' });
                } else {
                  // password is incorrect
                  logger.error('error verifying password');
                  res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
                }
              }).catch((err) => {
                // error verifying password
                logger.error(err);
                res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
              });
            } else {
              // credentials not found
              res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
            }
          }).catch((err) => {
            // error getting password
            logger.error(err);
            res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
          });
        } else {
          // user does not exist
          res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
        }
      }).catch((err) => {
        logger.error(err);
        res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
      });
    },
  });
};

//
