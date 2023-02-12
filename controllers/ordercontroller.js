const order=require("../models/orderModel")
const cart=require("../models/cart_schema")
const product=require("../models/productschema")
const user=require("../models/userschema")
const moment=require("moment");
const { default: mongoose } = require("mongoose");
const coupenModel=require("../models/couponModel")
const Razorpay=require("razorpay");
const cartModel = require("../models/cart_schema");
const {inventory}=require("./helpers");
const User = require("../models/userschema");
const couponModel = require("../models/couponModel");
const { response } = require("express");
const orderModel = require("../models/orderModel");
const brandModel = require("../models/BrandName-shema");

var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })



module.exports={ 

toOrder:async(req,res,next)=>{
    try{
        const coupon=req.body.code;
        const payment = req.body.payment;
        const userId = req.session.user._id;
        const cartItems=await cartModel.findOne({user:userId});
        const addresses=await User.aggregate([
            {
                $match:{
                    _id:mongoose.Types.ObjectId(userId),
                },
            },
            {
                $project:{
                    address:{
                        $filter:{
                            input:"$address",
                            cond:{
                                $eq:["$$this.default", true],
                            },
                        },
                    },
                },
            },
        ]);
        const address=addresses[0].address;
        const products=cartItems.cart;
        console.log(req.body);
        if(payment=="COD"){
            const newOrder=new order({
                user: userId,
                orderedItems: products,
                 totalPrice: req.body.newTotal,
                deliveryAddress: address,
                paymentMethod: payment,
                paymentStatus: "Pending",
                orderStatus: "Confirmed",
                date: moment(Date.now()).format("DD-MM-YYYY"),
            });
             newOrder.save().then(async()=>{
                products.forEach(async(data)=>{
                    const productID = data._id;
                    
                    const productQty = data.quantity;
                    await inventory(productID, -productQty);
                });
                await couponModel.findOneAndUpdate(
                    {couponCode:coupon},
                    {$push:{users:{user:userId}},$inc:{couponCount:-1}}
                );
                await cartModel.findOneAndRemove({user:userId});
                res.json({response:"success"});
              });
        }else if(payment=="onLine"){
            const newOrder=new order({
                user:userId,
                orderedItems: products,
          totalPrice: req.body.newTotal,
          deliveryAddress: address,
          paymentMethod: payment,
          paymentStatus: "Pending",
          orderStatus: "pending",
          date: moment(Date.now()).format("DD-MM-YYYY"),
            });
            newOrder.save().then((details)=>{
                const orderId = details._id.toString();
          const totalPrice = details.totalPrice;
          instance.orders.create({
            amount:totalPrice*100,
            currency: "INR",
            receipt: orderId,
          })
          .then((orders)=>{
            res.json({response:true,orders:orders});
          });
            });
        }
    }catch (error){
        next(error);
        console.log(error)
    }
},
toverifypayment:async(req,res,next)=>{
    try{
        const crypto = require("crypto");
        const payment = req.body.paymentStatus;
        log
        const orderIDDB = req.body.orders.receipt;
        const paymentID =payment.razorpay_payment_id;
        const orderId = payment.razorpay_order_id;
        const signature = payment.razorpay_signature;
        let hmac=crypto.createHmac("sha256,env.RAZORPAY_KEY_SECRET");
        hmac.update(orderId + "|" + paymentID);
        hmac=hmac.digest("hex");
        if(hmac==signature){
            const userId = req.session.user._id;
            await cartModel.findOne({user:userId}).then((cartItems)=>{
                let cartItem=cartItems.cart;
                cartItem.forEach(async(data)=>{
                    const productID = data.products._id;
          const qty = data.quantity;
          await inventory(productID, -qty);
          await cartModel.findOneAndRemove({user:userId})
                });
            });
        }
    }catch(error){
        next(error)
        log(error.message)
    }
},
toviewUserorder:async(req,res,next)=>{
    try{
        let user=req.session.user;
        const ID=req.session.user._id
        await orderModel
        .find({user:ID})
        .sort({_id:-1})
        .then((userOrderDetails)=>{
            res.render("user/userorderinfo",{userOrderDetails,user})
            
        })
    }catch(error){
        console.log(error.message);
        next(error);
    }
},
tocancelOrder:async(req,res,next)=>{
    try{
        console.log("hai");
        const userID=req.session.user._Id;
        const ID=req.body.id;
        
        const orders=await orderModel.findById(ID);
        const total=orders.totalPrice;
        const paymentMethod=orders.paymentMethod;
        const orderStatus=orders.orderStatus;
        const products=orders.orderedItems;
        if(orderStatus==="confirmed"){
            products.forEach((product)=>{
                const productID=product.products._id;   
                const QTY=product.quantity;
                inventory(productID,QTY)

            });
        } 
        await orderModel.findByIdAndUpdate(ID,{
            $set:{orderStatus:"cancelled"}
        }).then(e=>{
            console.log(e)
        })
}catch(error){
    next(error)
}

},
toreturnOrder:async(req,res,next)=>{
    try{
        const userID=req.session.user._id;
        const ID=req.body.id;
        await orderModel
        .findByIdAndUpdate(ID,{
            $set:{orderStatus:"Returned"},
        })
        .then(async(details)=>{
            let products=details.orderedItems;
            products.forEach((product)=>{
                const productID=product.products._id;
                const QTY=product.quantity;
                inventory(productID,QTY);
            });
            
        })
    }catch(error){
        next(Error)
    }
},
userOrderDetails:async(req,res,next)=>{
    try{
        const userID=req.session.user._Id;
        const ID=req.params.id;
        console.log(ID)
        console.log('orderDetail');
       const orderDetail=  await orderModel.findById(ID).populate({path:'orderedItems.product_id',model:'Products',populate:{path:'brandname',model:'brandName'}})
       console.log('hhhh');
       console.log(orderDetail.orderedItems);
        res.render("user/userOrderDetails",{orderDetail})
       }catch(error){
         next(error)
       }
     },


};
 