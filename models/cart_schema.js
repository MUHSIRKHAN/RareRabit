const mongoose = require('mongoose')
const User = require("../models/userschema");
const cartSchema=mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
           // required:true
        },
        cart:[
            {
                product_id:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'Products',
                    // required:true
                },
                quantity:{
                    type:Number,
                    default:1,
                    min:1,
                },
                total:{
                    type:Number
                }
        }
    ],subTotal:{
        type:Number
    }
        
    },{ timestamps: true }
)

const cartModel=mongoose.model('cart',cartSchema)

module.exports =cartModel