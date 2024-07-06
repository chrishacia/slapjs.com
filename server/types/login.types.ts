export interface UserCredentials {
    pass: string;
    salt: string;
    is_locked: number;
    verified: number;
    status: number;
  }

  export interface CreateLoginData {
    create_ts: string;
    email: string;
    pass: string;
    salt: string;
  }

  export interface LoginResult {
    insertId: number;
  }
