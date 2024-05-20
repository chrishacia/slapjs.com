const restful = require('./restful');
const translations = require('./translations');

let invalidMethodHandler, responseHandler;

// Dynamically require 'restful.response'
function loadHandlers() {
    const handlers = require('./restful.response');
    invalidMethodHandler = handlers.invalidMethodHandler;
    responseHandler = handlers.responseHandler;
}

module.exports = {
    get invalidMethodHandler() {
        if (!invalidMethodHandler) loadHandlers();
        return invalidMethodHandler;
    },
    get responseHandler() {
        if (!responseHandler) loadHandlers();
        return responseHandler;
    },
    restful,
    translations
};
