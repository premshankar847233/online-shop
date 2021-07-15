const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//register a user => /api/v1/register

exports.registerUser = catchAsyncError(async (req,res,next)=>{

    const {name,email,password} = req.body;

    const user =await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:'avatars/kccvibpsuiusmwfepb3m',
            url:'https://res.cloudinary.com/shopit/image/upload/v1606305757/avatars/kccvibpsuiusmwfepb3m.png'
        }
    })
   sendToken(user,200,res);
})

//Login User  => api/v1/login
exports.loginUser = catchAsyncError(async(req,res,next) =>{
    const {email,password} = req.body;

    //check if email and password is entered by user
    if(!email || !password)
    {
        return next(new ErrorHandler('Please enter email & password',400));
    }

    //finding user in database

    const user = await User.findOne({email}).select('-createdAt +password');

    if(!user)
    {
        return next(new ErrorHandler('Invalid Login Credentials',401));
    }

    //check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched)
    {
        return next(new ErrorHandler('Invalid Login Credentials',401));
    }
   sendToken(user,200,res);
})

//Forgot Password => api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req,res,next) =>{

    const user = await User.findOne({email:req.body.email});
    console.log(user);

    if(!user)
    {
        return next(new ErrorHandler('User not found with this email',404));
    }

    //get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    //create reset password url

    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follows:\n\n${resetUrl}\n\n If youhave not requested this email, then ignore it`;

    try
    {
        await sendEmail({
            email:user.email,
            subject: 'Prem Shop password recovery',
            message
        })

        res.status(200).json({
            success:true,
            message:`messsage send to ${user.email}`
        })
    }
    catch(err)
    {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(err.message,500));
    }

})

//Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req,res,next)=>{

    //Hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })

    if(!user)
    {
        return next(new ErrorHandler('Password reset token is invalid or has been expired',401))
    }

    if(req.body.password !== req.body.confirmpassword)
    {
        return next(new ErrorHandler('Password does not match',400));
    }

    //set up new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user,200,res);
})

//get currently logged in uder details
exports.getUserProfile = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
})

//Update / change password => api/v1/password/update
exports.updatePassword = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.user.id).select('+password');
    //check previous user password
    const isMatched = await user.comparePassword(req.body.oldpassword)

    if(!isMatched)
    {
        return next(new ErrorHandler('Old Password is incorrect',400))
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user,200,res)
})

//update user profile => /api/v1/me/update

exports.updateProfile = catchAsyncError(async (req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email:req.body.email
    }

    //update avatar: todo

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        user
    })
})

//logout user => api/v1/logout)

exports.logout = catchAsyncError(async (req,res,next)=>{

    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        status:true,
        message:"User loged out Successfully"
    })
})

//Admin routes

//Get All Users => /api/v1/admin/users

exports.allUsers = catchAsyncError(async (req,res,next)=>{

    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

//get user details  => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.params.id)

    if(!user)
    {
        return next(new ErrorHandler(`User does not exists with this particular id :${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//update user details  => /api/v1/admin/user/:id

exports.updateUser = catchAsyncError(async (req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    //update avatar: todo

    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        user
    })
})

//delete user => /api/v1/admin/user/:id

exports.deleteUser = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.params.id)

    if(!user)
    {
        return next(new ErrorHandler(`user does not exist with this id: ${req.params.id}`,400))
    }
    //remove avatar from cloudinary - todo
    await user.remove();
    res.status(200).json({
        success: true,
    })
})
