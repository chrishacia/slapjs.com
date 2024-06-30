import { Request, Response } from 'express';
import { invalidMethodHandler, restful } from '../helpers/index';

// const handleForgotPassword1 = async (req, res) => {
//     return null;
// }

export default function exampleHandler(req: Request, res: Response) {
    restful(req, res, {
        post: { handler: (req, res) => invalidMethodHandler(req, res, 'POST_EXAMPLE_HANDLER') },
        get: { handler: (req, res) => invalidMethodHandler(req, res, 'GET_EXAMPLE_HANDLER') },
        put: { handler: (req, res) => invalidMethodHandler(req, res, 'PUT_EXAMPLE_HANDLER') },
        delete: { handler: (req, res) => invalidMethodHandler(req, res, 'DELETE_EXAMPLE_HANDLER') },
    });
}