//create and send token and sasve in the cookie
const sendToken = (user,statusCode,res) =>{

    //create Jwt token
    const token = user.getJwtToken();

    //Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME*24*60*60*1000
        ),
        httpOnly:true
    }

    res.status(statusCode).cookie('token',token,options).json({
        status : true,
        token
    })
}

module.exports = sendToken;