import { Request, Response, NextFunction } from 'express';
import validator from 'email-validator';
import xssFilters from 'xss-filters';

import { RequestWithSession } from '../../types/server-sessions';
import { restful, invalidMethodHandler } from '../../helpers/index';
import { logger } from '../../logger';
import { Login, Users } from '../../data/index';
import { verifyPassword, generateJwtToken, getUtcDateTime } from '../../utils/index';

const login = new Login();
const user = new Users();

const closeDb = async () => {
    await login.closeConnection();
    await user.closeConnection();
};
/**
 * TODO: Add Failed Login Attempts check, lock account after 5 failed attempts
 * TODO: Add Unknow User check, block IP after 5 failed attempts
 */

const handleLogin = async (req: RequestWithSession, res: Response) => {
    try {
        const { email, password } = req.body;
        const safeEmail = xssFilters.inHTMLData(email);
        const safePassword = xssFilters.inHTMLData(password);

        if (!await user.getUserExistsByEmail(safeEmail)) {
            res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
            throw new Error('AUTHENTICATION_FAILED');
        }

        const userId = await user.getUserIdByEmail(safeEmail);
        const creds = await login.getPassDetailsForComparison(safeEmail);

        if (creds.length === 0) {
            res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
            throw new Error('AUTHENTICATION_FAILED');
        }

        if (!await verifyPassword(safePassword, creds[0].salt, creds[0].pass)) {
            res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
            throw new Error('AUTHENTICATION_FAILED');
        }

        const session = {
            id: userId,
            email: email,
            create_ts: getUtcDateTime(),
        };

        const token = generateJwtToken(session, '1h');
        const refreshToken = generateJwtToken(session, '30d');

        req.session.userId = JSON.stringify(session);
        req.session.email = email;
        res.status(200).json({ data: { ...session, token, refreshToken }, error: '' });

    } catch (err) {
        logger.error(err);
        res.status(400).json({ data: [], error: 'AUTHENTICATION_FAILED' });
    } finally {
        closeDb();
    }
};

const validateInputs = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    if (!email) {
        res.status(400).json({ data: [], error: 'EMAIL_EMPTY' });
        return;
    }

    if (!validator.validate(email)) {
        res.status(400).json({ data: [], error: 'EMAIL_INVALID' });
        return;
    }

    if (!password) {
        res.status(400).json({ data: [], error: 'PASSWORD_EMPTY' });
        return;
    }

    next();
};

export default function loginHandler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: handleLogin, middleware: [validateInputs] },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_LOGIN_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_LOGIN_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_LOGIN_HANDLER') },
    });
}
