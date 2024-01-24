const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');

module.exports = function logoutHandler(req, res) {
  restful(req, res, {
    async get() {
      invalidUseLogger('logoutHandler', 'GET', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async put() {
      invalidUseLogger('logoutHandler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async delete() {
      invalidUseLogger('logoutHandler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    async post() {
      req.session.destroy(err => {
        if (err) {
          // handle error
          logger.error(err);
          res.status(500).json({ data: [], error: 'LOGOUT_FAILED' });
          return;
        }
        res.clearCookie('connect.sid');
        res.status(405).json({ data: [], error: '' });
        return;
      });
    },
  });
};
