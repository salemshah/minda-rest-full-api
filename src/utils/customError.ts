export default class CustomError extends Error {
    statusCode: number;
    errorCode?: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
