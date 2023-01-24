const mongoose = require('mongoose');

const connectDB= async ()=>{
    try{
        await mongoose.connect("mongodb+srv://muhsir:QBBbzCVX3RMFHOE3@cluster0.usyhtns.mongodb.net/?retryWrites=true&w=majority",{
            useUnifiedTopology: true ,
            useNewUrlParser: true
        })
    }catch(err){
        console.log(err.message)
    }
}

module.exports=connectDB;