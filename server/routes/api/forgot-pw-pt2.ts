import { Request, Response } from 'express';

import { invalidMethodHandler, restful } from '../../helpers/index';

// const handleForgotPassword1 = async (req, res) => {
//     return null;
// }

export default function forgotPw2Handler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: (req, res) => invalidMethodHandler(req, res, 'POST_FORGOTPW2_HANDLER') },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_FORGOTPW2_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_FORGOTPW2_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_FORGOTPW2_HANDLER') },
    });
}