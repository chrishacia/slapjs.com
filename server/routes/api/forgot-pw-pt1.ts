import { Request, Response } from 'express';

import { invalidMethodHandler, restful } from '../../helpers/index';

// const handleForgotPassword1 = async (req, res) => {
//     return null;
// }

export default function forgotPw1Handler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: (req, res) => invalidMethodHandler(req, res, 'POST_FORGOTPW1_HANDLER') },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_FORGOTPW1_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_FORGOTPW1_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_FORGOTPW1_HANDLER') },
    });
}