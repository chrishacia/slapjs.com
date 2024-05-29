export interface UserCredentials {
    pass: string;
    salt: string;
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
