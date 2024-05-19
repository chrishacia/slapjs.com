const {invalidMethodHandler, restful, responseHandler, translations} = require('../../helpers/index');
const { logger } = require('../../logger');

const handleLogout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
              // handle error
              logger.error(err);
              responseHandler(res, { data: [], error: translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
              return;
            }
            res.clearCookie('connect.sid');
            res.status(405).json({ data: [], error: '' });
            return;
          });
    } catch (err) {
        logger.error(err);
        responseHandler(res, { data: [], error: translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
    }
}

module.exports = function LOGOUTHandler(req, res) {
    restful(req, res, {
        post: [handleLogout],
        get: invalidMethodHandler(res, 'GET_LOGOUT_HANDLER'),
        put: invalidMethodHandler(res, 'PUT_LOGOUT_HANDLER'),
        delete: invalidMethodHandler(res, 'DELETE_LOGOUT_HANDLER')
    });
};