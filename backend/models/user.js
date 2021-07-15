const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,'Please Enter Your Name'],
        maxLength:[30,'Your Name Can not Exceeds 30 character']
    },
    email:{
        type:String,
        required:[true,'Please enter your email'],
        unique:true,
        validate:[validator.isEmail,'Please Enter a Valid Email for Registration']
    },
    password:{
        type:String,
        required:[true,'Please Enter Your Password'],
        minLength:[6,'Please select a Password with minimum 6 character'],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})

//encrypting password before saving user

userSchema.pre('save',async function(next){

    if(!this.isModified('password')){
        next()
    }

    this.password = await bcrypt.hash(this.password,10);
})

//return JWT token
userSchema.methods.getJwtToken = function(){

    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    });
}

//compare user password

userSchema.methods.comparePassword = async function(enteredPassword){

    return bcrypt.compare(enteredPassword,this.password);
}

//Generate password reset token

userSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString('hex');

    //hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //set resetpasswordtoken expires time

    this.resetPasswordExpire = Date.now() + 30*60*1000

    return resetToken;
}

module.exports = mongoose.model('User',userSchema);