const {invalidMethodHandler, responseHandler} = require('./restful.response');
const restful = require('./restful');
const translations = require('./translations');

module.exports = {
    invalidMethodHandler,
    responseHandler,
    restful,
    translations
}