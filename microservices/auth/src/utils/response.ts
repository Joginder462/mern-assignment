const successResponse = (data: any = [], message = 'Success') => {
    return {
        status: true,
        message,
        data,
    };
};

const errorResponse = (errorMessage: string = 'Error occurred', data: any = null) => {
    return {
        status: false,
        message: errorMessage,
        data,
    };
};

export { successResponse, errorResponse };