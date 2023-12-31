const restful = require('../helpers/restful');
const logger = require('../logger');
// const handleSendResult = require('../helpers/handleSendResult');

module.exports = function exampleHandler(req, res) {
  logger.info('exampleHandler called');

  restful(req, res, {
    get() {
      // code here for get request
    },
    post() {
      // code here for get request
    },
  });
};
