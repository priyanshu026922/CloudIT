class ApiError extends Error{
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = "" //error stack
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors= errors

        if(stack){
            this.stack = stack
        }
        else
        {
            Error.captureStackTrace(this , this.constructor)//auto generate the trace
        }
    }
}

export {ApiError}


//Stack trace =A detailed report of where and how an error happened in the code