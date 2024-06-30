/* eslint-disable @typescript-eslint/no-unused-vars */

import { env as prod } from './prod.env';
import { env as local } from './local.env';

export const env = {
    ...local
};
