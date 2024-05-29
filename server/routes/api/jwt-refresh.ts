import { Request, Response } from 'express';

import { restful, invalidMethodHandler } from '../../helpers';
import { logger } from '../../logger';
import { JwtModel } from '../../data';
import { verifyJwtToken, generateJwtToken, getUtcDateTime } from '../../utils';

const handleJWTRefresh = async (req: Request, res: Response) => {
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
        jwtModel.updateRefreshToken(jwtToken.userId, { refreshToken: newRefreshToken });
        jwtModel.closeConnection();

        res.status(200).json({ data: { userId, accessToken, refreshToken: newRefreshToken }, error: '' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ data: [], error: 'JWT_REFRESH_FAILED' });
    }
};

export default function jwtRefreshHandler(req: Request, res: Response) {
    restful(req, res, {
        post: {
            handler: handleJWTRefresh
        },
        get: {
            handler: (req: Request, res: Response) => invalidMethodHandler(req, res, 'GET_JWTREFRESH_HANDLER')
        },
        put: {
            handler: (req: Request, res: Response) => invalidMethodHandler(req, res, 'PUT_JWTREFRESH_HANDLER')
        },
        delete: {
            handler: (req: Request, res: Response) => invalidMethodHandler(req, res, 'DELETE_JWTREFRESH_HANDLER')
        }
    });
}
