import { Request, Response, NextFunction } from 'express';
import validator from 'email-validator';
import xssFilters from 'xss-filters';
import {HttpStatusCode} from '../../types/http-status.types';
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
 * TODO: Account can only login if they are verified
 * TODO: Account cant login if they are banned or disabled
 * TODO: Known accounts can attempt to login again after 30 minutes
 * TODO: Add 2FA  (can be toggled on/off in settings)
 * TODO: Add Google Recaptcha (can be toggled on/off in settings)
 * TODO: Add Google login  (can be toggled on/off in settings)
 * TODO: Add Facebook login (can be toggled on/off in settings)
 * TODO: Add Twitter login (can be toggled on/off in settings)
 * TODO: Add Apple login (can be toggled on/off in settings)
 * TODO: Add Microsoft login (can be toggled on/off in settings)
 * TODO: Add LinkedIn login (can be toggled on/off in settings)
 * TODO: Add Github login (can be toggled on/off in settings)
 * TODO: Add Instagram login (can be toggled on/off in settings)
 * TODO: Add Twitch login (can be toggled on/off in settings)
 * TODO: Add Discord login (can be toggled on/off in settings)
 */

const MAX_FAILED_ATTEMPTS = 5;

const handleLogin = async (req: RequestWithSession, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const safeEmail = xssFilters.inHTMLData(email);
        const safePassword = xssFilters.inHTMLData(password);
        const ip = req.ip || '';

        logger.info(`Attempting login for email: ${safeEmail}, IP: ${ip}`);

        if (await login.isIpBlocked(ip)) {
            logger.warn(`IP ${ip} is blocked`);
            res.status(HttpStatusCode.FORBIDDEN).json({ data: [], error: 'IP_BLOCKED', error_no: 5 });
            return;
        }

        if (!await user.getUserExistsByEmail(safeEmail)) {
            logger.warn(`Email ${safeEmail} does not exist`);
            await login.incrementFailedAttempts(safeEmail);
            if (await login.getFailedAttempts(safeEmail) >= MAX_FAILED_ATTEMPTS) {
                await login.lockAccount(safeEmail);
                await login.blockIp(ip);
            }
            res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'AUTHENTICATION_FAILED', error_no: 1 });
            return;
        }

        logger.info(`Email ${safeEmail} exists. Checking account status.`);

        await login.unlockAccount(safeEmail);
        const creds = await login.getPassDetailsForComparison(safeEmail);

        if (creds.length === 0) {
            logger.warn(`No credentials found for email ${safeEmail}`);
            await login.incrementFailedAttempts(safeEmail);
            if (await login.getFailedAttempts(safeEmail) >= MAX_FAILED_ATTEMPTS) {
                await login.lockAccount(safeEmail);
                await login.blockIp(ip);
            }
            res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'AUTHENTICATION_FAILED', error_no: 2 });
            return;
        }

        if (creds[0].is_locked) {
            logger.warn(`Account for email ${safeEmail} is locked`);
            res.status(HttpStatusCode.FORBIDDEN).json({ data: [], error: 'ACCOUNT_LOCKED', error_no: 6 });
            return;
        }

        if (!creds[0].verified) {
            logger.warn(`Account for email ${safeEmail} is not verified`);
            res.status(HttpStatusCode.FORBIDDEN).json({ data: [], error: 'ACCOUNT_NOT_VERIFIED', error_no: 7 });
            return;
        }

        if (creds[0].status === 0) {
            logger.warn(`Account for email ${safeEmail} is disabled`);
            res.status(HttpStatusCode.FORBIDDEN).json({ data: [], error: 'ACCOUNT_DISABLED', error_no: 8 });
            return;
        }

        if (!await verifyPassword(safePassword, creds[0].salt, creds[0].pass)) {
            logger.warn(`Invalid password for email ${safeEmail}`);
            await login.incrementFailedAttempts(safeEmail);
            if (await login.getFailedAttempts(safeEmail) >= MAX_FAILED_ATTEMPTS) {
                await login.lockAccount(safeEmail);
                await login.blockIp(ip);
            }
            res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'AUTHENTICATION_FAILED', error_no: 3 });
            return;
        }

        logger.info(`Password verified for email ${safeEmail}. Resetting failed attempts.`);

        await login.resetFailedAttempts(safeEmail);
        const userId = await user.getUserIdByEmail(safeEmail);

        await closeDb();

        const session = {
            userId: userId,
            email: email,
            create_ts: getUtcDateTime(),
        };

        const token = generateJwtToken(session, '1h');
        const refreshToken = generateJwtToken(session, '30d');

        req.session.userId = JSON.stringify(session);
        req.session.email = email;
        res.status(HttpStatusCode.OK).json({ data: { ...session, token, refreshToken }, error: '' });

        logger.info(`Login successful for email ${safeEmail}. Tokens generated and session created.`);

    } catch (err) {
        logger.error(`Error during login process: ${err}`);
        if (!res.headersSent) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'AUTHENTICATION_FAILED', error_no: 4 });
        }
    }
};

const validateInputs = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;

    if (!email) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'EMAIL_EMPTY' });
        return;
    }

    if (!validator.validate(email)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'EMAIL_INVALID' });
        return;
    }

    if (!password) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ data: [], error: 'PASSWORD_EMPTY' });
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
