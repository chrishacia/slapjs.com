export interface ResponseHandlerData<T = unknown> {
    data: T;
    error: string;
    status: number;
    method: string;
    responseHandler: string;
  }

  export interface LoginData {
    create_ts: string;
    email: string;
    pass: string;
    salt: string;
  }

  export interface UserCredentials {
    pass: string;
    salt: string;
  }
