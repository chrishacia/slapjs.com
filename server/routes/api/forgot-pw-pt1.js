const {invalidMethodHandler, restful} = require('../../helpers/index');

// const handleForgotPassword1 = async (req, res) => {
//     return null;
// }

module.exports = function loginHandler(req, res) {
    restful(req, res, {
        post: invalidMethodHandler(res, 'POST_LOGIN_HANDLER'),
        get: invalidMethodHandler(res, 'GET_LOGIN_HANDLER'),
        put: invalidMethodHandler(res, 'PUT_LOGIN_HANDLER'),
        delete: invalidMethodHandler(res, 'DELETE_LOGIN_HANDLER')
    });
};