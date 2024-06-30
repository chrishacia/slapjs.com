import dotenv from 'dotenv';
import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import {HttpStatusCode} from '../types/http-status.types';

dotenv.config();

const secretKey = process.env.SERVER_SESSION_SECRET as string;

interface JwtPayloadExtended extends JwtPayload {
  // Add any custom fields you expect in the decoded JWT payload here

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface RequestWithUser extends Request {
    user?: JwtPayloadExtended; // Add the optional user property
  }


const getJwtTokenDetails = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization;
  const options: VerifyOptions = {
    algorithms: ['HS256'],
  };

  if (!token) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({ data: [], error: 'JWT_MISSING' });
    return;
  }

  jwt.verify(token, secretKey, options, (err, decoded) => {
    if (err) {
      res.status(HttpStatusCode.UNAUTHORIZED).json({ data: [], error: 'JWT_INVALID' });
      return;
    }

    req.user = decoded as JwtPayloadExtended; // Ensure the decoded token is of the extended payload type
    next();
  });
};

const generateJwtToken = (payload: JwtPayloadExtended, expiresIn?: string | number): string => {
  const options: SignOptions = {
    expiresIn: expiresIn || '1h',
    issuer: `${process.env.BASE_URL}`,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, secretKey, options);
};

const verifyJwtToken = (token: string): JwtPayloadExtended => {
  const options: VerifyOptions = {
    algorithms: ['HS256'],
  };

  return jwt.verify(token, secretKey, options) as JwtPayloadExtended;
};

export {
  generateJwtToken,
  getJwtTokenDetails,
  verifyJwtToken,
};
