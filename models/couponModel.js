const mongoose=require("mongoose");
const coupenSchema=new mongoose.Schema({
    couponCode: {
        type: String,
        unique: true,
        trim: true,
      },
      discount: {
        type: Number,
      },
      startingDate: {
        type: String,
      },
      minCartAmount:{
        type: Number,
      },
    
      EndingDate: {
        type: String,
      },
      discountLimit: {
        type: Number,
      },
      couponCount:{
        type: Number,
      },
      couponStatus: {
        type: Boolean,
        default: true,
      },
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
        },
      ],
    });
    const couponModel=mongoose.model("coupon",coupenSchema);
    module.exports=couponModel;


console.log("coupon");