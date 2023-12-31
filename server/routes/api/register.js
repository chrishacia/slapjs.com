const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const xssFilters = require('xss-filters');
const zxcvbn = require('zxcvbn');
const dotenv = require('dotenv');
const restful = require('../../helpers/restful');
const { getUtcDateTime } = require('../../../shared/utils/date.functions');
const { hashPassword } = require('../../utils/password.functions');
const Creds = require('../../data/models/creds.model');
const Users = require('../../data/models/users.model');
const Login = require('../../data/models/login.model');
const logger = require('../../logger');

dotenv.config();

module.exports = function registrationHandler(req, res) {
  restful(req, res, {
    /*
    *
    * GET: /api/register
    * when registering, check if email exists
    *
    */
    get() {
      // check if email exists
      const { email } = req.query;
      if (!email) {
        res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
        return;
      }

      if (!validator.validate(email)) {
        res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
        return;
      }

      // user exists, get existing password to compare, create session
      const u = new Users();
      const safeEmail = xssFilters.inHTMLData(email);
      u.getUserExistsByEmail(safeEmail).then((exists) => {
        if (exists) {
          res.status(200).json({ data: true, error: '' });
        } else {
          res.status(200).json({ data: false, error: 'USER_NOT_FOUND' });
        }
      }).catch((err) => {
        // error getting email
        logger.error(err);
        res.status(400).json({ data: [], error: 'INVALID_EMAIL' });
      });
    },

    /*
    *
    * POST: /api/register
    * creates the new user account login and sends verification email
    *
    */

    post() {
      // register a new user
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

      const safeEmail = xssFilters.inHTMLData(email);
      const { score } = zxcvbn(psswrd);
      const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
      if (score < 2) {
        res.status(400).json({ data: [], error: `PASSWORD_${scoreVerb[score].toUpperCase()}` });
        return;
      }

      // user exists, get existing password to compare, create session
      const u = new Users();

      u.getUserExistsByEmail(safeEmail).then((exists) => {
        if (!exists) {
          hashPassword(psswrd).then((saltAndHash) => {
            const l = new Login();
            l.createLogin({
              create_ts: getUtcDateTime(),
              email: safeEmail,
              pass: saltAndHash[1],
              salt: saltAndHash[0],
            }).then(() => {
              u.getUserIdByEmail(safeEmail).then((userId) => {
                if (!userId) {
                  res.status(400).json({ data: [], error: 'CREATE_VERIFICATION_FAILED' });
                  return;
                }

                const c = new Creds();
                const timestamp = getUtcDateTime();
                const vType = 'reg';
                const hashy = bcrypt.hashSync(`${userId}${timestamp}${vType}${process.env.SERVER_SECRET_KEY}`, 10);
                c.createUserVerification({
                  user_id: userId,
                  issuedAt: timestamp,
                  hashy,
                  vType,
                }).then((verification) => {
                  // TODO: send email
                  res.status(200).json({ data: verification, error: '' });
                }).catch((err) => {
                  logger.error(err);
                  res.status(400).json({ data: [], error: 'CREATE_VERIFICATION_FAILED' });
                });
              }).catch((err) => {
                logger.error(err);
                res.status(400).json({ data: [], error: 'CREATE_LOGIN_FAILED' });
              });
            }).catch((err) => {
              logger.error(err);
              res.status(400).json({ data: [], error: 'CREATE_LOGIN_FAILED' });
            });
          }).catch((err) => {
            logger.error(err);
            res.status(400).json({ data: [], error: 'CREATE_LOGIN_FAILED' });
          });
        } else {
          res.status(400).json({ data: false, error: 'USER_FOUND' });
        }
      }).catch((err) => {
        // error getting email
        logger.error(err);
        res.status(400).json({ data: [], error: 'INVALID_EMAIL' });
      });
    },
  });
};
