const bcrypt = require('bcryptjs');
const xssFilters = require('xss-filters');
const zxcvbn = require('zxcvbn');
const dotenv = require('dotenv');
const { Creds, Users, Login } = require('../../data/index');
const {invalidMethodHandler, restful, responseHandler, translations} = require('../../helpers/index');
const { hashPassword, getUtcDateTime } = require('../../utils/index');
const { logger } = require('../../logger');
dotenv.config();

const validateInputs = (req, res) => {
    const { email, password, firstName, lastName, dobMonth, dobDay, dobYear } = req.body;

    const validateField = (field, { maxLength, minLength, regex, emptyError, tooLongError, tooShortError, invalidError }) => {
        if (!field) {
            responseHandler(res, { data: [], error: translations('en', emptyError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (field.length > maxLength) {
            responseHandler(res, { data: [], error: translations('en', tooLongError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (field.length < minLength) {
            responseHandler(res, { data: [], error: translations('en', tooShortError), status: 400, method: 'POST', responseHandler: 'validateField' });
            return false;
        }
        if (!regex.test(field)) {
            responseHandler(res, { data: [], error: translations('en', invalidError), status: 400, method: 'POST', responseHandler: 'validateField' });
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
        if (!validateField(field, config)) {
            return false;
        }
    }

    if (!password) {
        responseHandler(res, { data: [], error: translations('en', 'PASSWORD_EMPTY'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return false;
    }
    if (password.length > 50) {
        responseHandler(res, { data: [], error: translations('en', 'PASSWORD_TOO_LONG'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return false;
    }
    if (password.length < 8) {
        responseHandler(res, { data: [], error: translations('en', 'PASSWORD_TOO_SHORT'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return false;
    }
    if (!/^(?!.*(.)\1{3})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d!@#$%^&*()_+{}[\]:;"'<>,.?/~`|-]).{12,}$/.test(password)) {
        responseHandler(res, { data: [], error: translations('en', 'PASSWORD_INVALID'), status: 400, method: 'POST', responseHandler: 'validateField' });
        return false;
    }

    const { score } = zxcvbn(password);
    const scoreVerb = ['Risky', 'Weak', 'Medium', 'Tough', 'Strongest'];
    if (score < 2) {
        responseHandler(res, { data: [], error: translations('en', `PASSWORD_${scoreVerb[score].toUpperCase()}`), status: 400, method: 'POST', responseHandler: 'validateField' });
        return false;
    }

    return true;
};

const handleRegistration = async (req, res) => {
    if (!validateInputs(req, res)) { return; }

    const { email, password, firstName, lastName, dobMonth, dobDay, dobYear } = req.body;
    const safeEmail = xssFilters.inHTMLData(email);

    // user exists, get existing password to compare, create session
    try {
        const user = new Users();
        if (await user.getUserExistsByEmail(safeEmail)) {
            responseHandler(res, { data: [], error: translations('en', 'USER_ALREADY_EXISTS'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error('USER_ALREADY_EXISTS');
        }

        const hashedPassword = await hashPassword(password).catch((err) => {
            responseHandler(res, { data: [], error: translations('en', 'CREATE_LOGIN_FAILED_HASH'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error(`CREATE_LOGIN_FAILED_HASH: ${err}`)
        });

        const login = new Login();
        await login.createLogin({
            create_ts: getUtcDateTime(),
            email: safeEmail,
            pass: hashedPassword[1],
            salt: hashedPassword[0],
        }).catch((err) => {
            responseHandler(res, { data: [], error: translations('en', 'CREATE_LOGIN_FAILED_CREATION'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error({ 'CREATE_LOGIN_FAILED_CREATION': err });
        });

        const userId = await user.getUserIdByEmail(safeEmail).catch((err) => {
            responseHandler(res, { data: [], error: translations('en', 'CREATE_LOGIN_FAILED_GET_USER'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
            throw new Error(`CREATE_LOGIN_FAILED_GET_USER: ${err}`);
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
                responseHandler(res, { data: verification, error: '' });
                return;
            })
            .catch((err) => {
                logger.error(err);
                responseHandler(res, { data: [], error: translations('en', 'CREATE_VERIFICATION_FAILED'), status: 422, method: 'POST', responseHandler: 'handleRegistration' });
                return;
            });


        await user.createUserInformation({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            profile_img: '',
            dob: `${dobYear}-${dobMonth}-${dobDay}`
        }).catch((err) => {
            logger.error(err);
        });

    } catch (err) {
        logger.error(err);
        responseHandler(res, { data: [], error: translations('en', 'CREATE_INFORMATION_FAILED'), status: 500, method: 'POST', responseHandler: 'handleRegistration' });
        return;
    }
}

module.exports = function loginHandler(req, res) {
    restful(req, res, {
        post: [validateInputs, handleRegistration],
        get: invalidMethodHandler(res, 'GET_LOGIN_HANDLER'),
        put: invalidMethodHandler(res, 'PUT_LOGIN_HANDLER'),
        delete: invalidMethodHandler(res, 'DELETE_LOGIN_HANDLER')
    });
};
