const User = require('../models/userschema');
const { hash } = require('bcryptjs');


exports.userRegister=async(req,res)=>{
    const user = {email,mobile,password}=req.body;
    try{
        const hashedpassword=await hash(password,10);
        user.password = hashedpassword
        User.create(user).then((e)=>{
            res.redirect('/')
        })

    }catch(err){
        console.log(err.message)

    }
}
