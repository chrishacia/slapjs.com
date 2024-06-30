import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const DEFAULT_PORT = 3000;
export const PORT = process.env.SERVER_PORT || DEFAULT_PORT;
export const MAX_AGE_IN_MS = 259200000; // 3 days
export const SESSION_SECRET = process.env.SERVER_SESSION_SECRET!;
export const ENV = process.env.SERVER_ENV || 'development';
export const WHITELIST = (process.env.SERVER_WHITELIST ?? '').split(',');
export const VIEWS_PATH = path.join(__dirname, '..', 'server', 'views');
export const STATIC_PATH = path.join(__dirname, 'public');
export const IS_PRODUCTION = ENV === 'production';
