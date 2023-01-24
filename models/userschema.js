const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({     
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isBanned: {
    type: Boolean,
    default: false
},
address:[
  {
    name:{
      type:String,
    },
    country:{
      type:String,

    },
    address:{
      type:String,
    },
    city:{
      type:String,
    },
    state:{
      type:String
    },
    postcode:{
      type:String,
    },
    phone:{
      type:Number,
    },default:{
      type:Boolean,
      default:false,
    },
  }
],
date:{
  type:String,
  default:Date.now,
}
});


const User = mongoose.model("User", UserSchema);

module.exports = User;
