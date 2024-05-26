import { invalidUseLogger } from '../logger';
import { translations } from '../helpers/index';
import { Request, Response } from 'express';

const responseHandler = (req: Request, res: Response, data: {
    data: any;
    error: string;
    status: number;
    method: string;
    responseHandler: string;
} = {
    data: '',
    error: '',
    status: 200,
    method: 'UNKNOWN',
    responseHandler: 'responseHandlerUndefined',
}): void => {
    const { data: responseData, error, status, method, responseHandler } = data;

    if (error) {
        invalidUseLogger(responseHandler, method, req);
    }
    res.status(status).json({ data: responseData, error });
}

const invalidMethodHandler = (req: Request, res: Response, handler: string): void => {
    invalidUseLogger(handler, req.method, req);
    res.status(405).json({ data: [], error: translations('en', 'METHOD_NOT_SUPPORTED') });
};

export {
    invalidMethodHandler,
    responseHandler,
}
