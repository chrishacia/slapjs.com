export interface validationConfigObject {
    maxLength: number;
    minLength: number;
    regex: RegExp;
    emptyError: string;
    tooLongError: string;
    tooShortError: string;
    invalidError: string;
}