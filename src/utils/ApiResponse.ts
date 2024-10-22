class ApiResponse {
    public statusCode: number;
    public message: string;
    public data: any;
    public success: boolean;

    constructor(
        statusCode: number,
        message: string = 'Success',
        data: any,
    ) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

export { ApiResponse };
