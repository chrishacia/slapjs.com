const restful = require('../../helpers/restful');
const { logger, invalidUseLogger } = require('../../logger');

module.exports = function forgotPwPt2Handler(req, res) {
  restful(req, res, {
    get() {
      invalidUseLogger('forgotPwPt2Handler', 'GET', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    put() {
      invalidUseLogger('forgotPwPt2Handler', 'PUT', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    delete() {
      invalidUseLogger('forgotPwPt2Handler', 'DELETE', req);
      res.status(405).json({ data: [], error: 'METHOD_NOT_SUPPORTED' });
    },
    post() {
      logger.info('forgotPwPt2Handler', 'POST', null);
    },
  });
};
