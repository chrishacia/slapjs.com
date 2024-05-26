import { Request, Response } from 'express';

import { invalidMethodHandler, restful, responseHandler, translations } from '../../helpers/index';
import { logger } from '../../logger';

interface RequestWithSession extends Request {
    session: any;
}

const handleLogout = async (req: RequestWithSession, res: Response) => {
    try {
        req.session.destroy((err: any) => {
            if (err) {
              // handle error
              logger.error(err);
              responseHandler(req, res, { data: [], error: translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
              return;
            }
            res.clearCookie('connect.sid');
            res.status(405).json({ data: [], error: '' });
            return;
          });
    } catch (err) {
        logger.error(err);
        responseHandler(req, res, { data: [], error: translations('en', 'LOGOUT_FAILED'), status: 500, method: 'POST', responseHandler: 'handleLogout' });
    }
}

export default function LOGOUTHandler(req: Request, res: Response) {
    restful(req, res, {
        post: [handleLogout],
        get: invalidMethodHandler(req, res, 'GET_LOGOUT_HANDLER'),
        put: invalidMethodHandler(req, res, 'PUT_LOGOUT_HANDLER'),
        delete: invalidMethodHandler(req, res, 'DELETE_LOGOUT_HANDLER')
    });
};