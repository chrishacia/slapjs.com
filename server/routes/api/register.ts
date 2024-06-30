import bcrypt from 'bcryptjs';
import xssFilters from 'xss-filters';
import zxcvbn from 'zxcvbn';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { Creds, Users, Login } from '../../data/index';
import { invalidMethodHandler, restful, responseHandler, translations } from '../../helpers/index';
import { hashPassword, getUtcDateTime } from '../../utils/index';
import { logger } from '../../logger';
import { HttpStatusCode } from '../../types/http-status.types';
import {validationConfigObject} from '../../types/registration.types';
dotenv.config();


const MAX_PASSWORD_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_MIN_SCORE = 2;

const validateInputs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, firstName, lastName, dobMonth, dobDay, dobYear } = req.body;

    const validateField = async (field: string, config: validationConfigObject) => {
        if (!field) {
            responseHandler(req, res, { data: [], error: await translations('en', config.emptyError), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (field.length > config.maxLength) {
            responseHandler(req, res, { data: [], error: await translations('en', config.tooLongError), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (field.length < config.minLength) {
            responseHandler(req, res, { data: [], error: await translations('en', config.tooShortError), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (!config.regex.test(field)) {
            responseHandler(req, res, { data: [], error: await translations('en', config.invalidError), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        return true;
    };

    const validations = [
        { field: email, config: { maxLength: 255, minLength: 5, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, emptyError: 'EMAIL_EMPTY', tooLongError: 'EMAIL_TOO_LONG', tooShortError: 'EMAIL_TOO_SHORT', invalidError: 'EMAIL_INVALID' } },
        { field: firstName, config: { maxLength: 50, minLength: 2, regex: /^[a-zA-Z]+$/, emptyError: 'FIRST_NAME_EMPTY', tooLongError: 'FIRST_NAME_TOO_LONG', tooShortError: 'FIRST_NAME_TOO_SHORT', invalidError: 'FIRST_NAME_INVALID' } },
        { field: lastName, config: { maxLength: 50, minLength: 2, regex: /^[a-zA-Z]+$/, emptyError: 'LAST_NAME_EMPTY', tooLongError: 'LAST_NAME_TOO_LONG', tooShortError: 'LAST_NAME_TOO_SHORT', invalidError: 'LAST_NAME_INVALID' } },
        { field: dobMonth, config: { maxLength: 2, minLength: 1, regex: /^[0-9]+$/, emptyError: 'DOB_MONTH_EMPTY', tooLongError: 'DOB_MONTH_TOO_LONG', tooShortError: 'DOB_MONTH_TOO_SHORT', invalidError: 'DOB_MONTH_INVALID' } },
        { field: dobDay, config: { maxLength: 2, minLength: 1, regex: /^[0-9]+$/, emptyError: 'DOB_DAY_EMPTY', tooLongError: 'DOB_DAY_TOO_LONG', tooShortError: 'DOB_DAY_TOO_SHORT', invalidError: 'DOB_DAY_INVALID' } },
        { field: dobYear, config: { maxLength: 4, minLength: 4, regex: /^[0-9]+$/, emptyError: 'DOB_YEAR_EMPTY', tooLongError: 'DOB_YEAR_TOO_LONG', tooShortError: 'DOB_YEAR_TOO_SHORT', invalidError: 'DOB_YEAR_INVALID' } }
    ];

    for (const { field, config } of validations) {
        if (!await validateField(field, config)) {
            return;
        }
    }

    if (!password) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_EMPTY'), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_TOO_LONG'), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_TOO_SHORT'), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (!/^(?!.*(.)\1{3})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+{}[\]:;"'<>,.?/~`|-]).{12,}$/.test(password)) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_INVALID'), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
        return;
    }

    const { score } = zxcvbn(password);
    const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
    if (score < PASSWORD_MIN_SCORE) {
        responseHandler(req, res, { data: [], error: await translations('en', `PASSWORD_${scoreVerb[score].toUpperCase()}`), status: HttpStatusCode.BAD_REQUEST, method: 'POST', responseHandler: 'validateField' });
        return;
    }

    next();
};

const handleRegistration = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, dobMonth, dobDay, dobYear } = req.body;
    const safeEmail = xssFilters.inHTMLData(email);

    // user exists, get existing password to compare, create session
    try {
        const user = new Users();
        if (await user.getUserExistsByEmail(safeEmail)) {
            responseHandler(req, res, { data: [], error: await translations('en', 'USER_ALREADY_EXISTS'), status: HttpStatusCode.UNPROCESSABLE_ENTITY, method: 'POST', responseHandler: 'handleRegistration' });
            return;
        }

        const hashedPassword = await hashPassword(password).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_HASH'), status: HttpStatusCode.UNPROCESSABLE_ENTITY, method: 'POST', responseHandler: 'handleRegistration' });
            logger.error(`CREATE_REGISTRATION_FAILED_HASH: ${err}`);
            return;
        }) as [string, string];

        const login = new Login();
        await login.createLogin({
            create_ts: getUtcDateTime(),
            email: safeEmail,
            pass: hashedPassword[1],
            salt: hashedPassword[0],
        }).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_CREATION'), status: HttpStatusCode.UNPROCESSABLE_ENTITY, method: 'POST', responseHandler: 'handleRegistration' });
            logger.error(`CREATE_REGISTRATION_FAILED_CREATION: ${err}`);
            return;
        });

        const userId = await user.getUserIdByEmail(safeEmail).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_GET_USER'), status: HttpStatusCode.UNPROCESSABLE_ENTITY, method: 'POST', responseHandler: 'handleRegistration' });
            logger.error(`CREATE_REGISTRATION_FAILED_GET_USER: ${err}`);
            return;
        }) as number;

        const timestamp = getUtcDateTime();
        const vType = 'reg';
        const BCRYPT_SALT_ROUNDS = 10;
        const hashy = bcrypt.hashSync(`${userId}${timestamp}${vType}${process.env.SERVER_SECRET_KEY}`, BCRYPT_SALT_ROUNDS);

        const creds = new Creds();
        await creds.createUserVerification({
            user_id: userId,
            issuedAt: timestamp,
            hashy,
            vType,
        }).then((verification) => {
            // TODO: send email
            console.log(verification);
            responseHandler(req, res, { data: { userId, email: safeEmail }, error: '', status: HttpStatusCode.OK, method: 'POST', responseHandler: 'handleRegistration' });
        }).catch(async (err) => {
            logger.error(err);
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_VERIFICATION_FAILED'), status: HttpStatusCode.UNPROCESSABLE_ENTITY, method: 'POST', responseHandler: 'handleRegistration' });
        });

        await user.createUserInformation({
            id: userId,
            name: `${firstName} ${lastName}`,
            profile_img: '',
            dob: `${dobYear}-${dobMonth}-${dobDay}`
        }).catch((err) => {
            logger.error(err);
        });

    } catch (err) {
        logger.error(err);
        responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_INFORMATION_FAILED'), status: 500, method: 'POST', responseHandler: 'handleRegistration' });
    }
};

export default function registrationHandler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: handleRegistration, middleware: [validateInputs] },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_REGISTRATION_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_REGISTRATION_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_REGISTRATION_HANDLER') },
    });
}
