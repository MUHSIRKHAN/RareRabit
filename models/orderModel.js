const mongoose=require("mongoose");
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,

    },
    orderedItems:[   
  
     ],
    totalPrice:{
        type:Number,

    },
    deliveryAddress:{
        type:Array
    },
    paymentMethod:{
        type:String
    },
    paymentStatus:{
        type:String
    },
    orderStatus:{
        type:String
    },
    date:{
        type:String,
        default:Date.now
    }
},{
    timestamps:true
}
);
const orderModel=mongoose.model("orders",orderSchema);
module.exports=orderModel