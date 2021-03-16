export interface IInitiateResetEmailPassword {
    email: string;
}

export interface IResetEmailPassword {
    token: string;
    password: string;
    passwordConfirmation: string;
}