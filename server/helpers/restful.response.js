const { invalidUseLogger } = require('../logger');
const { translations } = require('../helpers/index');

const responseHandler = (res, data = {
    data: [],
    error: '',
    status: 200,
    method: 'UNKNOWN',
    responseHandler: 'responseHandlerUndefined',
}) => {
    const { data: responseData, error, status, method, responseHandler } = data;

    if (error) {
        invalidUseLogger(responseHandler, method, res);
    }
    res.status(status).json({ data: responseData, error });
}

const invalidMethodHandler = (req, res, handler) => {
    invalidUseLogger(handler, req.method, req);
    res.status(405).json({ data: [], error: translations('en', 'METHOD_NOT_SUPPORTED') });
};

module.exports = {
    invalidMethodHandler,
    responseHandler,
}
