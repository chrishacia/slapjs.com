import { Request, Response } from 'express';
import { invalidUseLogger } from '../logger';
import { translations } from '../helpers/index';
import { ResponseHandlerData } from '../types/restful.response.types';
import {HttpStatusCode} from '../types/http-status.types';

const responseHandler = <T>(
  req: Request,
  res: Response,
  data: ResponseHandlerData<T> = {
    data: null as T,
    error: '',
    status: 200,
    method: 'UNKNOWN',
    responseHandler: 'responseHandlerUndefined',
  }
): void => {
  const { data: responseData, error, status, method, responseHandler } = data;

  if (error) {
    invalidUseLogger(responseHandler, method, req);
  }
  res.status(status).json({ data: responseData, error });
};

const invalidMethodHandler = (req: Request, res: Response, handler: string): void => {
  invalidUseLogger(handler, req.method, req);
  res.status(HttpStatusCode.METHOD_NOT_ALLOWED).json({ data: [], error: translations('en', 'METHOD_NOT_SUPPORTED') });
};

export {
  invalidMethodHandler,
  responseHandler,
};
