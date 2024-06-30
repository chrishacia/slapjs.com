import { env } from '../config/env';

const canDebug: boolean = env.debug || env.environment === 'development';

const logger = {
    log: (...args: unknown[]): void => {
        if (canDebug) {
            console.log(...args);
        }
    },
    error: (...args: unknown[]): void => {
        if (canDebug) {
            console.error(...args);
        }
    },
    warn: (...args: unknown[]): void => {
        if (canDebug) {
            console.warn(...args);
        }
    }
};

export default logger;
