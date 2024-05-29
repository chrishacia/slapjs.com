import { Request, Response, NextFunction } from 'express';

export interface Handler {
    (req: Request, res: Response): Promise<void> | void;
}

export interface Middleware {
    (req: Request, res: Response, next: NextFunction): Promise<void> | void;
}

export interface Handlers {
    [method: string]: MethodHandlers;
}

export interface ErrorResponse<T = unknown> {
    data: T;
    error: string;
    status: number;
    method: string;
    responseHandler: string;
}

export interface MethodHandlers {
    handler: Handler;
    middleware?: Middleware[];
}

// export interface ErrorResponse {
//     data: unknown;
//     error: string;
//     status: number;
//     method: string;
//     responseHandler: string;
// }
