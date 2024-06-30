import { Request, Response } from 'express';
import { invalidMethodHandler, restful, responseHandler, translations } from '../../helpers/index';
import { logger } from '../../logger';
import { RequestWithSession } from '../../types/server-sessions';
import { HttpStatusCode } from '../../types/http-status.types';

const handleLogout = async (req: RequestWithSession, res: Response) => {
    try {
            req.session.destroy(async (err): Promise<void> => {
                    if (err) {
                        // handle error
                        logger.error(err);
                        responseHandler(req, res, { data: [], error: await translations('en', 'LOGOUT_FAILED'), status: HttpStatusCode.INTERNAL_SERVER_ERROR, method: 'GET', responseHandler: 'handleLogout' });
                        return;
                    }
                    res.clearCookie('connect.sid');
                    res.status(HttpStatusCode.METHOD_NOT_ALLOWED).json({ data: [], error: '' });
                    return;
                });
    } catch (err) {
        logger.error(err);
        responseHandler(req, res, { data: [], error: await translations('en', 'LOGOUT_FAILED'), status: HttpStatusCode.INTERNAL_SERVER_ERROR, method: 'GET', responseHandler: 'handleLogout' });
    }
};

export default function loginHandler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: (req, res) => invalidMethodHandler(req, res, 'POST_LOGOUT_HANDLER') },
        get: { handler: handleLogout },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_LOGOUT_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_LOGOUT_HANDLER') },
    });
}