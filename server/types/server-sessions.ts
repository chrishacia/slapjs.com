import session from 'express-session';
import { Request } from 'express';

export interface SessionData extends session.Session {
    create_ts?: string;
    userId?: string;
    email?: string;
}

export interface RequestWithSession extends Request {
    session: SessionData;
}