const {restful, invalidMethodHandler} = require ('../../helpers');
const { logger } = require('../../logger');
const { JwtModel } = require('../../data');
const { verifyJwtToken, generateJwtToken, getUtcDateTime } = require('../../utils');

const handleJWTRefresh = async (req, res) => {
    try {
        const { refreshToken, userId } = req.body;

        if (!refreshToken) {
            res.status(401).json({ data: [], error: 'INVALID_REFRESH_TOKEN_MISSING', 'number': 1 });
            return;
        }

        const jwtToken = verifyJwtToken(refreshToken);

        if (!jwtToken) {
            res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN', 'number': 2 });
            return;
        }

        const jwtModel = new JwtModel();
        const token = jwtModel.getRefreshToken(jwtToken.userId);

        if (token !== refreshToken) {
            res.status(403).json({ data: [], error: 'INVALID_REFRESH_TOKEN_MISMATCH', 'number': 3 });
            jwtModel.closeConnection();
            return;
        }

        const session = {
            id: userId,
            create_ts: getUtcDateTime(),
        };

        const accessToken = generateJwtToken(session, '1h');
        const newRefreshToken = generateJwtToken(session, '30d');

        await jwtModel.createRefreshToken(userId, refreshToken);
        jwtModel.updateRefreshToken(jwtToken.userId, newRefreshToken);
        jwtModel.closeConnection();

        res.status(200).json({ data: { userId, accessToken, refreshToken: newRefreshToken }, error: '' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ data: [], error: 'JWT_REFRESH_FAILED' });
    }
}

module.exports = function jwtRefreshHandler(req, res) {
    restful(req, res, {
        post: {
            handler: handleJWTRefresh
        },
        get: {
            handler: (req, res) => invalidMethodHandler(req, res, 'GET_JWTREFRESH_HANDLER')
        },
        put: {
            handler: (req, res) => invalidMethodHandler(req, res, 'PUT_JWTREFRESH_HANDLER')
        },
        delete: {
            handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_JWTREFRESH_HANDLER')
        }
    });
};
