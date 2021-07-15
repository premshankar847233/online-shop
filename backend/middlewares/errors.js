const ErrorHandler = require('../utils/errorHandler');

module.exports = (err,req,res,next) =>{

    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    if(process.env.NODE_ENV==='DEVELOPMENT')
    {
        return res.status(err.statusCode).json({
            success:false,
            errorMessage: err.message,
            Error: err,
            stack:err.stack
        })
    }

   if(process.env.NODE_ENV === 'PRODUCTION')
   {
       let error = {...err}
       error.message = err.message;

       //wrong mogoose id error

       if(err.name === 'CastError')
       {
           const message = `Resource not found invalid: ${err.path}`;
           error = new ErrorHandler(message,400);
       }

       //handling mongoose validation error

       if(err.name === 'ValidationError')
       {
           const message = Object.values(err.errors).map(value => value.message);
           error = new ErrorHandler(message,400)
       }

       //Handling mongoose duplicate key error
       if(err.code===11000)
       {
           const message = `Duplicate ${Object.keys(err.keyValue)} entered`
           error = new ErrorHandler(message,400)
       }

       //Handling wrong JWT error
        if(err.name === 'JsonWebTokenError')
        {
            const message = 'JSON Web Token is Invalid. Try again!!!'
            error = new ErrorHandler(message,400);
        }

        //Handling expired JWT error
        {

            if(err.name === 'TokenExpiredError')
            {
                const message = 'Json web Token expired'
                error = new ErrorHandler(message,400)
            }
        }
       res.status(error.statusCode).json({
           success: false,
           message: error.message || 'Internal Server Error'
       })
   }
}