//check if user is authenticated or not

const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require('../utils/errorHandler');
const jwt = require("jsonwebtoken");
const User = require('../models/user')

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next)=>{

    const {token} = req.cookies;
    if(!token)
    {
        return next(new ErrorHandler('User is unauthenticated,Login first to access this',400))
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    // console.log(req.user);
    next();
})

//handlin user roles
exports.authorizeRoles = (...roles) =>{
    return(req,res,next) =>{

        if(!roles.includes(req.user.role))
        {
           return next(new ErrorHandler(`Role ${req.user.role}is not allowed to access the resources`,403))
        }

        next()
    }
}