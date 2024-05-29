import { Request, Response } from 'express';

import { invalidMethodHandler, restful, responseHandler, translations } from '../../helpers/index';
import { logger } from '../../logger';
import { RequestWithSession } from '../../types/server-sessions';

const handleLogout = async (req: RequestWithSession, res: Response) => {
    try {
            req.session.destroy(async (err): Promise<void> => {
                    if (err) {
                        // handle error
                        logger.error(err);
                        responseHandler(req, res, { data: [], error: await translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
                        return;
                    }
                    res.clearCookie('connect.sid');
                    res.status(405).json({ data: [], error: '' });
                    return;
                });
    } catch (err) {
        logger.error(err);
        responseHandler(req, res, { data: [], error: await translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
    }
};

export default function loginHandler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: handleLogout },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_LOGOUT_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_LOGOUT_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_LOGOUT_HANDLER') },
    });
}