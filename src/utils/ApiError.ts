interface ErrorsArr {}

class ApiError extends Error {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public errors: ErrorsArr[];

    constructor(
        statusCode: number = 500,
        message: string = 'Something went wrong',
        errors: ErrorsArr[] = [],
        stack: string = ''
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
