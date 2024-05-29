export interface UpdateUserCredentialsData {
    pass: string;
    salt: string;
    email: string;
}

export interface CreateUserVerificationData {
    user_id: number;
    issuedAt: string;
    hashy: string;
    vType: string;
}

export interface ValidateUserVerificationData {
    id: number;
    user_id: string;
    hashy: string;
}
