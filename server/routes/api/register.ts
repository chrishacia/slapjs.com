import bcrypt from 'bcryptjs';
import xssFilters from 'xss-filters';
import zxcvbn from 'zxcvbn';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import { Creds, Users, Login } from '../../data/index';
import { invalidMethodHandler, restful, responseHandler, translations } from '../../helpers/index';
import { hashPassword, getUtcDateTime } from '../../utils/index';
import { logger } from '../../logger';

dotenv.config();

interface validationConfigObject {
    maxLength: number;
    minLength: number;
    regex: RegExp;
    emptyError: string;
    tooLongError: string;
    tooShortError: string;
    invalidError: string;
}

const validateInputs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, firstName, lastName, dobMonth, dobDay, dobYear } = req.body;

    const validateField = async (field: string, { maxLength, minLength, regex, emptyError, tooLongError, tooShortError, invalidError }: validationConfigObject) => {
        if (!field) {
            responseHandler(req, res, { data: [], error: await translations('en', emptyError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return;
        }
        if (field.length > maxLength) {
            responseHandler(req, res, { data: [], error: await translations('en', tooLongError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return;
        }
        if (field.length < minLength) {
            responseHandler(req, res, { data: [], error: await translations('en', tooShortError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return;
        }
        if (!regex.test(field)) {
            responseHandler(req, res, { data: [], error: await translations('en', invalidError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return;
        }
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
        if (!validateField(field, config)) {
            return;
        }
    }

    if (!password) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_EMPTY'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (password.length > 50) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_TOO_LONG'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (password.length < 8) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_TOO_SHORT'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return;
    }
    if (!/^(?!.*(.)\1{3})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+{}[\]:;"'<>,.?/~`|-]).{12,}$/.test(password)) {
        responseHandler(req, res, { data: [], error: await translations('en', 'PASSWORD_INVALID'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return;
    }

    const { score } = zxcvbn(password);
    const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
    if (score < 2) {
        responseHandler(req, res, { data: [], error: await translations('en', `PASSWORD_${scoreVerb[score].toUpperCase()}`), status: 400, method: 'POST', responseHandler: 'validateField' });
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
            responseHandler(req, res, { data: [], error: await translations('en', 'USER_ALREADY_EXISTS'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error('USER_ALREADY_EXISTS');
        }

        const hashedPassword = await hashPassword(password).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_HASH'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error(`CREATE_REGISTRATION_FAILED_HASH: ${err}`);
        });

        const login = new Login();
        await login.createLogin({
            create_ts: getUtcDateTime(),
            email: safeEmail,
            pass: hashedPassword[1],
            salt: hashedPassword[0],
        }).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_CREATION'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error(`CREATE_REGISTRATION_FAILED_CREATION: ${err}`);
        });

        const userId = await user.getUserIdByEmail(safeEmail).catch(async (err) => {
            responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_REGISTRATION_FAILED_GET_USER'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error(`CREATE_REGISTRATION_FAILED_GET_USER: ${err}`);
        });

        const timestamp = getUtcDateTime();
        const vType = 'reg';
        const hashy = bcrypt.hashSync(`${userId}${timestamp}${vType}${process.env.SERVER_SECRET_KEY}`, 10);

        const creds = new Creds();
        await creds.createUserVerification({
            user_id: userId,
            issuedAt: timestamp,
            hashy,
            vType,
        })
            .then((verification) => {
                // TODO: send email
                console.log(verification);
                responseHandler(req, res, { data: { userId, email: safeEmail }, error: '', status: 200, method: 'POST', responseHandler: 'handleRegistration' });
                return;
            })
            .catch(async (err) => {
                logger.error(err);
                responseHandler(req, res, { data: [], error: await translations('en', 'CREATE_VERIFICATION_FAILED'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
                return;
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
        return;
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
